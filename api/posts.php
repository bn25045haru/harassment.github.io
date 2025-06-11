<?php
// エラー表示を有効にする (開発時のみ。本番環境では無効にすること)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// セッションを開始 (これがないと$_SESSIONが使えない)
session_start();

// CORSを許可
header('Access-Control-Allow-Origin: *'); // 本番環境では特定のオリジンに制限することを推奨
header('Access-Control-Allow-Methods: POST, GET, OPTIONS'); // 許可するメソッドを指定
header('Access-Control-Allow-Headers: Content-Type, Authorization'); // 許可するヘッダーを指定
header('Content-Type: application/json'); // JSON形式でレスポンスを返すことを指定

// OPTIONSリクエストへの対応 (CORSプリフライトリクエスト)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // プリフライトリクエストは常に成功として返す
    exit();
}

require_once 'db_connect.php'; // データベース接続ファイルをインクルード

// GETリクエスト（投稿の取得）
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // postsテーブルとusersテーブルをJOINして、投稿者のユーザー名も取得
        $stmt = $pdo->query("SELECT p.id, p.user_id, p.content, p.created_at, u.username
                             FROM posts p
                             JOIN users u ON p.user_id = u.id
                             ORDER BY p.created_at DESC");
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $posts]);

    } catch (PDOException $e) {
        // データベースエラー
        echo json_encode(['success' => false, 'message' => 'データベースエラー: ' . $e->getMessage()]);
    }
}
// POSTリクエスト（新しい投稿の作成）
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // ログインしているかチェック
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => '投稿するにはログインが必要です。']);
        exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);

    // ログイン中のユーザーIDをセッションから取得
    $user_id = $_SESSION['user_id'];
    $content = $data['content'] ?? '';

    // 入力値のバリデーション
    if (empty($content)) {
        echo json_encode(['success' => false, 'message' => '投稿内容を入力してください。']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO posts (user_id, content) VALUES (:user_id, :content)");
        $stmt->execute([
            'user_id' => $user_id, // ここでセッションのuser_idを使う
            'content' => $content
        ]);

        echo json_encode(['success' => true, 'message' => '投稿が完了しました！']);

    } catch (PDOException $e) {
        // データベースエラー
        echo json_encode(['success' => false, 'message' => 'データベースエラー: ' . $e->getMessage()]);
    }
}
// その他のリクエストメソッド
else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => '不正なリクエストメソッドです。']);
}
?>