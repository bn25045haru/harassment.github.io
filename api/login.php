<?php
// エラー表示を有効にする (開発時のみ。本番環境では無効にすること)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// セッションを開始
session_start();

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

    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    // 入力値のバリデーション
    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'メールアドレスとパスワードを入力してください。']);
        exit();
    }

    try {
        // メールアドレスでユーザーを検索
        $stmt = $pdo->prepare("SELECT id, username, email, password_hash FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // ユーザーが存在し、パスワードが一致するか検証
        if ($user && password_verify($password, $user['password_hash'])) {
            // ログイン成功
            // セッションにユーザー情報を保存
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['email'] = $user['email'];

            echo json_encode([
                'success' => true,
                'message' => 'ログインに成功しました！',
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email']
                ]
            ]);
        } else {
            // ログイン失敗
            echo json_encode(['success' => false, 'message' => 'メールアドレスまたはパスワードが間違っています。']);
        }

    } catch (PDOException $e) {
        // データベースエラー
        echo json_encode(['success' => false, 'message' => 'データベースエラー: ' . $e->getMessage()]);
    }
} else {
    // POST以外のリクエストの場合
    echo json_encode(['success' => false, 'message' => '不正なリクエストメソッドです。']);
}
?>