<?php
// エラー表示を有効にする (開発時のみ。本番環境では無効にすること)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// CORSを許可
header('Access-Control-Allow-Origin: *'); // 本番環境では特定のオリジンに制限することを推奨
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json'); // JSON形式でレスポンスを返すことを指定

// OPTIONSリクエストへの対応 (CORSプリフライトリクエスト)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php'; // データベース接続ファイルをインクルード

// POSTリクエストかどうかを確認
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $username = $data['username'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    // 入力値のバリデーション
    if (empty($username) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => '全ての項目を入力してください。']);
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => '有効なメールアドレスを入力してください。']);
        exit();
    }

    // パスワードのハッシュ化
    // PASSWORD_BCRYPTは現在推奨されるハッシュアルゴリズム
    // saltは自動生成されるため不要
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    try {
        // ユーザー名またはメールアドレスがすでに存在しないか確認
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = :username OR email = :email");
        $stmt->execute(['username' => $username, 'email' => $email]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'そのユーザー名またはメールアドレスはすでに使用されています。']);
            exit();
        }

        // ユーザー情報をデータベースに挿入
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :password_hash)");
        $stmt->execute([
            'username' => $username,
            'email' => $email,
            'password_hash' => $password_hash
        ]);

        echo json_encode(['success' => true, 'message' => 'ユーザー登録が完了しました！']);

    } catch (PDOException $e) {
        // データベースエラー
        echo json_encode(['success' => false, 'message' => 'データベースエラー: ' . $e->getMessage()]);
    }
} else {
    // POST以外のリクエストの場合
    echo json_encode(['success' => false, 'message' => '不正なリクエストメソッドです。']);
}
?>