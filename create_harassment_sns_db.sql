-- データベースの作成（存在しない場合のみ）
CREATE DATABASE IF NOT EXISTS harassment_sns DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- データベースを選択
USE harassment_sns;

-- データベースの文字コードを明示的に設定（既に存在する場合の念のため）
ALTER DATABASE harassment_sns CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- users テーブルの作成
-- CREATE TABLE IF NOT EXISTS を使用することで、テーブルが存在しない場合のみ作成される
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci, -- カラムレベルでの文字コード指定
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; -- テーブルレベルでの文字コード指定

-- posts テーブルの作成
-- CREATE TABLE IF NOT EXISTS を使用することで、テーブルが存在しない場合のみ作成される
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL, -- ここを修正: NOT NULL の前に CHARACTER SET
    harassment_score DECIMAL(5,2) DEFAULT NULL,
    ai_feedback TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL, -- ここを修正: DEFAULT NULL の前に CHARACTER SET
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; -- テーブルレベルでの文字コード指定

-- テストユーザーの挿入
-- 注意: 実際のアプリでは、ユーザー登録フォームから安全にパスワードをハッシュ化して保存します
INSERT INTO users (username, password_hash, display_name) VALUES
('testuser', '$2y$10$Qj2h/aFhJ7J4M9aXwX5Z2.rN0e7p6t8u9v0w1x2y3z4A5B6C7D8E9F0', 'テストユーザー');