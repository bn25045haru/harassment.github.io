<?php
require_once 'db_connect.php'; // データベース接続ファイルを読み込む

header('Content-Type: application/json'); // JSON形式でレスポンスを返すことを指定

// CORS (Cross-Origin Resource Sharing) の設定
// 開発環境では全てのオリジンからのアクセスを許可するが、
// 本番環境では特定のオリジン (フロントエンドのURL) のみに制限すべき
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// OPTIONS リクエストへの対応 (CORSプリフライトリクエスト)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 投稿の処理 (POSTリクエスト)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // 入力データの検証
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON input.']);
        exit();
    }
    if (!isset($data['content']) || !isset($data['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Content and user_id are required.']);
        exit();
    }

    $content = $data['content'];
    $userId = $data['user_id'];

    // ユーザーが存在するか確認 (簡易的な確認。実際には認証機能でログインユーザーのIDを使う)
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id = :user_id");
    $stmt->execute(['user_id' => $userId]);
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'User not found.']);
        exit();
    }

    try {
        // 投稿をデータベースに挿入
        $stmt = $pdo->prepare("INSERT INTO posts (user_id, content) VALUES (:user_id, :content)");
        $stmt->execute([
            'user_id' => $userId,
            'content' => $content
        ]);

        echo json_encode(['success' => true, 'message' => 'Post created successfully.', 'post_id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500); // Internal Server Error
        echo json_encode(['success' => false, 'message' => 'Failed to create post: ' . $e->getMessage()]);
    }
}

// 投稿の取得 (GETリクエスト)
elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // 最新の投稿をユーザー情報と共に取得 (JOINを使用)
        $stmt = $pdo->query("
            SELECT
                p.id,
                p.content,
                p.harassment_score,
                p.ai_feedback,
                p.created_at,
                u.username,
                u.display_name
            FROM
                posts p
            JOIN
                users u ON p.user_id = u.id
            ORDER BY
                p.created_at DESC
            LIMIT 20 -- 最新20件を取得
        ");
        $posts = $stmt->fetchAll();

        echo json_encode(['success' => true, 'posts' => $posts]);
    } catch (PDOException $e) {
        http_response_code(500); // Internal Server Error
        echo json_encode(['success' => false, 'message' => 'Failed to fetch posts: ' . $e->getMessage()]);
    }
}

// 未定義のメソッドへの対応
else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
}