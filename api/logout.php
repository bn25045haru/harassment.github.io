<?php
// エラー表示を有効にする (開発時のみ。本番環境では無効にすること)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// セッションを開始
session_start();

// CORSを許可
header('Access-Control-Allow-Origin: *'); // 本番環境では特定のオリジンに制限することを推奨
header('Access-Control-Allow-Methods: POST, OPTIONS'); // POSTとOPTIONSを許可
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json'); // JSON形式でレスポンスを返すことを指定

// OPTIONSリクエストへの対応 (CORSプリフライトリクエスト)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// POSTリクエストかどうかを確認
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 全てのセッション変数をクリア
    $_SESSION = array();

    // セッションクッキーを破棄
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }

    // セッションを破壊 (完全にセッションファイルを削除)
    session_destroy();

    echo json_encode(['success' => true, 'message' => 'ログアウトしました。']);
    exit();

} else {
    // POST以外のリクエストの場合
    echo json_encode(['success' => false, 'message' => '不正なリクエストメソッドです。']);
}
?>