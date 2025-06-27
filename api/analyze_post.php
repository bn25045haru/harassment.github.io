<?php
// api/analyze_post.php
header('Content-Type: application/json');

// 環境変数を読み込む（.envファイルからAPIキーを読み込む）
require_once 'load_env.php';

// APIキーを環境変数から取得
$openai_api_key = getenv('OPENAI_API_KEY');

// APIキーが設定されていない場合はエラーを返す
if (!$openai_api_key) {
    echo json_encode(['success' => false, 'message' => 'API key not configured.']);
    exit;
}

// リクエストボディからJSONデータを取得
$input_json = file_get_contents('php://input');
$data = json_decode($input_json, true);

// 投稿内容が空の場合はエラーを返す
if (empty($data['content'])) {
    echo json_encode(['success' => false, 'message' => 'Content is required for analysis.']);
    exit;
}

$post_content = $data['content'];

// OpenAI Moderation APIのエンドポイント
$url = 'https://api.openai.com/v1/moderations';

// APIリクエストのペイロード
$payload = json_encode([
    'input' => $post_content
]);

// cURLを使ってOpenAI APIを呼び出す
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $openai_api_key
]);

$response = curl_exec($ch);
$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// APIレスポンスをデコード
$moderation_result = json_decode($response, true);

if ($http_status !== 200 || !isset($moderation_result['results'][0])) {
    // API呼び出しに失敗した場合
    echo json_encode(['success' => false, 'message' => 'Failed to analyze content with AI.', 'details' => $response]);
    exit;
}

// 分析結果からカテゴリフラグとスコアを取得
$result = $moderation_result['results'][0];
$flagged = $result['flagged']; // trueなら不適切と判定
$categories = $result['categories'];
$category_scores = $result['category_scores'];

// 判定ロジック：いずれかのカテゴリで高いスコアが出たら注意を促す
$is_harassment_likely = false;
$harassment_score = 0;
$harassment_reasons = [];

// 「harassment」カテゴリのスコアをチェック（OpenAIのカテゴリ名）
if (isset($category_scores['harassment'])) {
    // ハラスメントカテゴリのスコアを100点満点に変換
    $harassment_score = round($category_scores['harassment'] * 100);
    if ($harassment_score > 50) { // 閾値を50%に設定
        $is_harassment_likely = true;
        $harassment_reasons[] = "ハラスメント";
    }
}

// 暴力的、性的、差別的などの関連カテゴリもチェック
$sensitive_categories = ['hate', 'hate/threatening', 'self-harm', 'self-harm/intent', 'self-harm/instructions', 'sexual', 'sexual/minors', 'violence', 'violence/graphic'];
foreach ($sensitive_categories as $cat) {
    if (isset($category_scores[$cat]) && $category_scores[$cat] > 0.5) { // 閾値を50%に設定
        $is_harassment_likely = true;
        $harassment_reasons[] = $cat;
    }
}

// 判定結果をJSONで返す
echo json_encode([
    'success' => true,
    'flagged' => $flagged, // OpenAIのフラグ
    'is_harassment_likely' => $is_harassment_likely,
    'harassment_score' => $harassment_score,
    'harassment_reasons' => array_unique($harassment_reasons), // 重複を削除
    'feedback' => $is_harassment_likely ? 'AIによる診断: ハラスメントの可能性が高いです。' : 'AIによる診断: 問題はありません。'
]);
?>