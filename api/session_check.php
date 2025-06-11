<?php
// エラー表示を有効にする (開発時のみ。本番環境では無効にすること)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// セッションを開始
session_start();

// CORSを許可
header('Access-Control-Allow-Origin: *'); // 本番環境では特定のオリジンに制限することを推奨
header('Access-Control-Allow-Methods: GET, OPTIONS'); // GETとOPTIONSを許可
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json'); // JSON形式でレスポンスを返すことを指定

// OPTIONSリクエストへの対応 (CORSプリフライトリクエスト)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// GETリクエスト（現在のセッション情報を取得）
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_SESSION['user_id'])) {
        // ログイン中のユーザー情報を返す
        echo json_encode([
            'success' => true,
            'isLoggedIn' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'username' => $_SESSION['username'],
                'email' => $_SESSION['email']
            ]
        ]);
    } else {
        // ログインしていない場合
        echo json_encode([
            'success' => true,
            'isLoggedIn' => false,
            'user' => null
        ]);
    }
} else {
    // GET以外のリクエストの場合
    echo json_encode(['success' => false, 'message' => '不正なリクエストメソッドです。']);
}
?>