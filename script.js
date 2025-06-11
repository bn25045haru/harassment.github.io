// Function to show a specific content section and update active nav link
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
        // data-section属性を持つ要素のみを対象にする
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
                // 投稿者のユーザー名を表示するように変更
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

// Function to check login status and update UI
async function checkLoginStatusAndUpdateUI() {
    try {
        const response = await fetch('api/session_check.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();

        const userProfileSmall = document.querySelector('.user-profile-small');
        const tweetButton = document.querySelector('.tweet-button');
        const postFormContainer = document.querySelector('.post-form-container');
        
        // サイドバーのナビゲーションリンクの親要素（li）を取得
        const navRegisterLi = document.getElementById('nav-register-li');
        const navLoginLi = document.getElementById('nav-login-li');
        const navLogoutLi = document.getElementById('nav-logout-li');

        if (result.success && result.isLoggedIn) {
            // ログイン済みの場合
            userProfileSmall.style.display = 'flex';
            document.querySelector('.user-profile-small .display-name-small').textContent = result.user.username;
            document.querySelector('.user-profile-small .username-small').textContent = `@${result.user.username}`;
            // ログインユーザーのアバター画像を設定する場合は、ここで動的に変更
            // document.querySelector('.user-profile-small .avatar-small').src = `images/${result.user.avatar_filename || 'avatar.png'}`;
            // 投稿フォームのプロフィール画像も更新
            // document.querySelector('.post-form-container .avatar-large').src = `images/${result.user.avatar_filename || 'avatar.png'}`;

            if (postFormContainer) {
                // 投稿フォームのHTMLを再構築（メッセージが表示されている場合があるため）
                postFormContainer.innerHTML = `
                    <img src="images/avatar.png" alt="User Avatar" class="avatar-large">
                    <textarea id="post-textarea" class="post-textarea" placeholder="ハラスメントの内容を投稿してください..."></textarea>
                    <button id="submit-post-button" class="submit-post-button">投稿</button>
                `;
                postFormContainer.style.display = 'flex';
                // submitPostButtonのイベントリスナーを再登録
                const newSubmitPostButton = document.getElementById('submit-post-button');
                if (newSubmitPostButton) {
                    // 古いイベントリスナーの削除（重要）
                    newSubmitPostButton.removeEventListener('click', submitPostHandler);
                    // 新しいイベントリスナーの追加
                    newSubmitPostButton.addEventListener('click', submitPostHandler);
                }
            }
            if (tweetButton) {
                tweetButton.style.display = 'block';
            }

            // ログイン/新規登録リンクを非表示にし、ログアウトリンクを表示
            if (navRegisterLi) navRegisterLi.style.display = 'none'; // li要素を非表示
            if (navLoginLi) navLoginLi.style.display = 'none';     // li要素を非表示
            if (navLogoutLi) navLogoutLi.style.display = 'flex'; // li要素をflexで表示

        } else {
            // ログインしていない場合
            userProfileSmall.style.display = 'none';
            
            if (postFormContainer) {
                postFormContainer.innerHTML = `
                    <p style="text-align: center; padding: 20px; color: #777;">投稿するには<a href="#" data-section="login-section" class="switch-link">ログイン</a>してください。</p>
                `;
                postFormContainer.style.display = 'block';

                // 動的に追加されたログインリンクを取得し、イベントリスナーを設定
                const loginLinkInPostForm = postFormContainer.querySelector('.switch-link[data-section="login-section"]');
                if (loginLinkInPostForm) {
                    loginLinkInPostForm.addEventListener('click', function(e) {
                        e.preventDefault();
                        const sectionId = this.dataset.section;
                        if (sectionId) {
                            showSection(sectionId);
                        }
                    });
                }
            }
            if (tweetButton) {
                tweetButton.style.display = 'none';
            }

            // ログイン/新規登録リンクを表示し、ログアウトリンクを非表示
            if (navRegisterLi) navRegisterLi.style.display = 'flex'; // li要素をflexで表示
            if (navLoginLi) navLoginLi.style.display = 'flex';     // li要素をflexで表示
            if (navLogoutLi) navLogoutLi.style.display = 'none'; // li要素を非表示

        }
    } catch (error) {
        console.error('Error checking login status:', error);
        // エラー時も未ログインとして扱う
        document.querySelector('.user-profile-small').style.display = 'none';
        const postFormContainer = document.querySelector('.post-form-container');
        if (postFormContainer) {
            postFormContainer.style.display = 'block';
            postFormContainer.innerHTML = `
                <p style="text-align: center; padding: 20px; color: #777;">投稿機能の読み込み中にエラーが発生しました。しばらくしてから再度お試しください。</p>
            `;
        }
        // エラー時もリンク表示を初期状態（未ログイン状態）に設定
        const navRegisterLi = document.getElementById('nav-register-li');
        const navLoginLi = document.getElementById('nav-login-li');
        const navLogoutLi = document.getElementById('nav-logout-li');
        if (navRegisterLi) navRegisterLi.style.display = 'flex';
        if (navLoginLi) navLoginLi.style.display = 'flex';
        if (navLogoutLi) navLogoutLi.style.display = 'none';
    }
}


// Function to handle post submission (イベントリスナーを関数として定義)
const submitPostHandler = async () => {
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
                content: postText // user_id はPHP側でセッションから取得
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
};

// Initial setup for submitPostButton (DOMContentLoadedで再設定されるので、初期設定は不要だが、念のため残す)
const submitPostButton = document.getElementById('submit-post-button');
if (submitPostButton) {
    submitPostButton.addEventListener('click', submitPostHandler);
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
                alert(result.message + ' ログインして投稿を開始しましょう！');
                // Clear form and go back to home or login page
                document.getElementById('register-username').value = '';
                document.getElementById('register-email').value = '';
                document.getElementById('register-password').value = '';
                showSection('login-section'); // 登録後、ログイン画面へ遷移
            } else {
                alert('登録失敗: ' + result.message);
            }
        } catch (error) {
            console.error('Error during registration:', error);
            alert('登録中にエラーが発生しました。ネットワーク接続を確認してください。');
        }
    });
}

// User Login Functionality
const loginSubmitButton = document.getElementById('login-submit-button');
if (loginSubmitButton) {
    loginSubmitButton.addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            alert('メールアドレスとパスワードを入力してください。');
            return;
        }

        try {
            const response = await fetch('api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message + ' ようこそ、' + result.user.username + 'さん！');
                
                // ログイン成功後、UIを更新
                document.getElementById('login-email').value = '';
                document.getElementById('login-password').value = '';
                await checkLoginStatusAndUpdateUI(); // ログイン状態をチェックし、UIを更新
                showSection('home-section'); // ホーム画面へ遷移

            } else {
                alert('ログイン失敗: ' + result.message);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('ログイン中にエラーが発生しました。ネットワーク接続を確認してください。');
        }
    });
}

// ログインフォーム内の「アカウントをお持ちでない方はこちら」リンクのイベントリスナー
// これをDOMContentLoaded内で処理すると、ログインセクションがactiveでないときにリンクが見つからない可能性があるため、
// 独立した場所、またはDOMContentLoaded外で定義する。
// ただし、このリンクは常にHTMLに存在するため、DOMContentLoaded外で直接アクセスしても問題ない。
const registerLinkInLoginForm = document.querySelector('#login-section .switch-link[data-section="register-section"]');
if (registerLinkInLoginForm) {
    registerLinkInLoginForm.addEventListener('click', function(e) {
        e.preventDefault();
        const sectionId = this.dataset.section;
        if (sectionId) {
            showSection(sectionId); // 新規登録セクションを表示
        }
    });
}


// Logout Functionality
const logoutLink = document.getElementById('nav-logout-link');
if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
        e.preventDefault(); // デフォルトのリンク動作を防ぐ

        if (!confirm('本当にログアウトしますか？')) {
            return; // キャンセルされたら何もしない
        }

        try {
            const response = await fetch('api/logout.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message);
                await checkLoginStatusAndUpdateUI(); // ログイン状態をチェックし、UIを更新
                showSection('login-section'); // ログアウト後、ログイン画面へ遷移
            } else {
                alert('ログアウトに失敗しました: ' + result.message);
            }
        } catch (error) {
            console.error('Error during logout:', error);
            alert('ログアウト中にエラーが発生しました。ネットワーク接続を確認してください。');
        }
    });
}


// Initial load and event listener setup on DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
    // まずログイン状態をチェックしてUIを更新
    await checkLoginStatusAndUpdateUI();
    // その後で投稿を取得
    await fetchPosts(); 
    // ホームセクションをデフォルトで表示
    showSection('home-section'); // 初回表示はホームセクション

    // Sidebar navigation event listeners
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        // ログアウトリンクはdata-sectionを持たないため除外（別途イベントリスナーを設定済み）
        if (link.id !== 'nav-logout-link') { 
            link.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent default link behavior
                const sectionId = this.dataset.section; // Get section ID from data-section attribute
                if (sectionId) {
                    showSection(sectionId); // Show the corresponding section
                }
            });
        }
    });
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