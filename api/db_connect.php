<?php
// エラー表示を有効にする (開発時のみ。本番環境では無効にすること)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// データベース接続情報
define('DB_HOST', 'localhost'); // MySQLサーバーのホスト名
define('DB_NAME', 'harassment_sns'); // ← この行が重要！ データベース名を定義
define('DB_USER', 'root'); // MySQLのユーザー名 (開発用。本番では適切なユーザーを作成)
define('DB_PASS', ''); // MySQLのパスワード (XAMPPのデフォルトは空)

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, // エラーモードを例外に設定
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, // デフォルトのフェッチモードを連想配列に設定
            PDO::ATTR_EMULATE_PREPARES => false, // プリペアドステートメントのエミュレーションを無効に (セキュリティ向上)
        ]
    );
} catch (PDOException $e) {
    // データベース接続エラー時の処理
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}