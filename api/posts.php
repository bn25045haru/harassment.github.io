<?php
// api/posts.php
// Handles fetching and creating posts, including AI-based harassment moderation.

header('Content-Type: application/json');

// Include database connection and environment variable loader
require_once 'db_connect.php';
require_once 'load_env.php';

// Start the session to get user information
session_start();

// Handle HTTP request methods (GET for fetching, POST for creating)
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // ====================================================================
        // GET Request: Fetch all posts from the database
        // ====================================================================
        try {
            // Select posts and join with users table to get usernames.
            // Also select the new AI analysis fields (ai_score, ai_feedback).
            $stmt = $pdo->prepare("SELECT p.id, p.content, p.created_at, p.ai_score, p.ai_feedback, u.username FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC");
            $stmt->execute();
            $posts = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $posts]);
        } catch (PDOException $e) {
            // Log database errors but return a generic message to the user for security.
            error_log("Database error fetching posts: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'データベースエラー。時間をおいてお試しください。']);
        }
        break;

    case 'POST':
        // ====================================================================
        // POST Request: Create a new post and analyze it with AI
        // ====================================================================
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'message' => 'ログインが必要です。']);
            exit;
        }

        $user_id = $_SESSION['user_id'];
        $input_json = file_get_contents('php://input');
        $data = json_decode($input_json, true);

        if (empty($data['content'])) {
            echo json_encode(['success' => false, 'message' => '投稿内容が空です。']);
            exit;
        }

        $content = $data['content'];
        $ai_score = null;
        $ai_feedback = null;

        // --- Start of OpenAI Moderation API analysis ---
        $openai_api_key = getenv('OPENAI_API_KEY');
        if ($openai_api_key) {
            $url = 'https://api.openai.com/v1/moderations';
            $payload = json_encode(['input' => $content]);
            
            // Use cURL to make the API request
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

            $moderation_result = json_decode($response, true);

            // Process the successful API response
            if ($http_status === 200 && isset($moderation_result['results'][0])) {
                $result = $moderation_result['results'][0];
                
                // Get harassment category score and convert to a percentage
                if (isset($result['category_scores']['harassment'])) {
                    $ai_score = round($result['category_scores']['harassment'] * 100);
                }
                
                // Set a feedback message based on the flagged status
                if ($result['flagged']) {
                    $ai_feedback = '該当する可能性が高い';
                } else {
                    $ai_feedback = '問題なし';
                }
            } else {
                // If API call fails, log the error and set default values
                error_log("OpenAI API call failed: HTTP Status $http_status, Response: $response");
                $ai_score = null;
                $ai_feedback = '診断失敗';
            }
        }
        // --- End of OpenAI Moderation API analysis ---

        // Insert the new post content and the AI analysis results into the database
        try {
            $stmt = $pdo->prepare("INSERT INTO posts (user_id, content, ai_score, ai_feedback) VALUES (?, ?, ?, ?)");
            $stmt->execute([$user_id, $content, $ai_score, $ai_feedback]);
            echo json_encode(['success' => true, 'message' => '投稿が成功しました。']);
        } catch (PDOException $e) {
            error_log("Post insertion failed: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => '投稿に失敗しました。']);
        }
        break;

    default:
        // Handle unsupported methods
        http_response_code(405); // Method Not Allowed
        echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
        break;
}
?>