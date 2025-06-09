// Function to show a specific content section and update active nav link
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        }
    });
}

// Function to fetch and display posts
async function fetchPosts() {
    try {
        const response = await fetch('api/posts.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        }

        const posts = await response.json();
        const postsList = document.getElementById('posts-list');
        postsList.innerHTML = ''; // Clear existing posts

        if (posts.success && posts.data.length > 0) {
            posts.data.forEach(post => {
                const postItem = document.createElement('div');
                postItem.classList.add('post-item');
                postItem.innerHTML = `
                    <img src="images/avatar.png" alt="User Avatar" class="avatar-large">
                    <div class="post-content">
                        <div class="post-header">
                            <span class="display-name">${post.username}</span>
                            <span class="username">@${post.username}</span>
                            <span class="timestamp">${post.created_at}</span>
                        </div>
                        <p class="post-text">${post.content}</p>
                        <div class="post-feedback" style="display:none;">
                            <span class="feedback-score">AI診断スコア: -</span>
                            <span class="feedback-source">（これはAIによる自動診断です）</span>
                        </div>
                        <div class="post-actions">
                            <span class="action-item"><i class="far fa-comment"></i> 0</span>
                            <span class="action-item"><i class="fas fa-retweet"></i> 0</span>
                            <span class="action-item"><i class="far fa-heart"></i> 0</span>
                            <span class="action-item"><i class="fas fa-share"></i></span>
                        </div>
                    </div>
                `;
                postsList.appendChild(postItem);
            });
        } else if (posts.success && posts.data.length === 0) {
            postsList.innerHTML = '<p style="text-align: center; color: #777;">まだ投稿がありません。</p>';
        } else {
            alert('投稿の取得に失敗しました: ' + posts.message);
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
        alert('投稿の取得中にエラーが発生しました。');
    }
}

// Function to handle post submission
const submitPostButton = document.getElementById('submit-post-button');
if (submitPostButton) {
    submitPostButton.addEventListener('click', async () => {
        const postText = document.getElementById('post-textarea').value;
        if (!postText.trim()) {
            alert('投稿内容を入力してください。');
            return;
        }

        try {
            const response = await fetch('api/posts.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: 1, // 仮のユーザーID。将来的にはログインユーザーのIDを使用
                    content: postText
                })
            });

            const result = await response.json();

            if (result.success) {
                alert('投稿が成功しました！');
                document.getElementById('post-textarea').value = ''; // Clear textarea
                fetchPosts(); // Refresh posts
            } else {
                alert('投稿に失敗しました: ' + result.message);
            }
        } catch (error) {
            console.error('Error submitting post:', error);
            alert('投稿中にエラーが発生しました。ネットワーク接続を確認してください。');
        }
    });
}

// User Registration Functionality
const registerSubmitButton = document.getElementById('register-submit-button');
if (registerSubmitButton) {
    registerSubmitButton.addEventListener('click', async () => {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        if (!username || !email || !password) {
            alert('全ての項目を入力してください。');
            return;
        }

        try {
            const response = await fetch('api/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message);
                // Clear form and go back to home or login page
                document.getElementById('register-username').value = '';
                document.getElementById('register-email').value = '';
                document.getElementById('register-password').value = '';
                showSection('home-section'); // Redirect to home for now
            } else {
                alert('登録失敗: ' + result.message);
            }
        } catch (error) {
            console.error('Error during registration:', error);
            alert('登録中にエラーが発生しました。ネットワーク接続を確認してください。');
        }
    });
}


// Sidebar navigation event listeners
const navLinks = document.querySelectorAll('.sidebar-nav a');
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default link behavior
        const sectionId = this.dataset.section; // Get section ID from data-section attribute
        if (sectionId) {
            showSection(sectionId); // Show the corresponding section
        }
    });
});

// Initial load: fetch posts and show home section
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts(); // Fetch posts on page load
    showSection('home-section'); // Show the home section by default
});

// --- ハラスメント診断機能（仮のロジック） ---
const startDiagnosisButton = document.querySelector('.start-diagnosis-button');
const submitDiagnosisButton = document.querySelector('.submit-diagnosis-button');
const diagnosisIntro = document.querySelector('.diagnosis-intro');
const diagnosisQuestions = document.querySelector('.diagnosis-questions');
const diagnosisResults = document.querySelector('.diagnosis-results');
const diagnosisTextarea = document.getElementById('diagnosis-textarea');
const diagnosisScore = document.getElementById('diagnosis-score');
const diagnosisFeedback = document.getElementById('diagnosis-feedback');

if (startDiagnosisButton) {
    startDiagnosisButton.addEventListener('click', () => {
        diagnosisIntro.style.display = 'none';
        diagnosisQuestions.style.display = 'block';
        diagnosisResults.style.display = 'none';
        diagnosisTextarea.value = ''; // テキストエリアをクリア
    });
}

if (submitDiagnosisButton) {
    submitDiagnosisButton.addEventListener('click', () => {
        const textToDiagnose = diagnosisTextarea.value.trim();
        if (textToDiagnose) {
            // ここにAI診断APIへのリクエストロジックを実装
            // 今はダミーの結果を表示
            const score = Math.floor(Math.random() * 100); // 0-99 のランダムスコア
            let feedback = 'この内容はハラスメントの可能性は低いです。';
            if (score > 70) {
                feedback = 'この内容はハラスメントの可能性が高いです。言葉遣いに注意しましょう。';
            } else if (score > 40) {
                feedback = 'この内容はハラスメントの可能性があるため、表現に配慮が必要です。';
            }

            diagnosisScore.textContent = `診断スコア: ${score}点`;
            diagnosisFeedback.textContent = `フィードバック: ${feedback}`;

            diagnosisQuestions.style.display = 'none';
            diagnosisResults.style.display = 'block';
        } else {
            alert('診断したい内容を入力してください。');
        }
    });
}