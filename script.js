document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const contentSections = document.querySelectorAll('.content-section');
    const postButton = document.querySelector('.submit-post-button');
    const postTextarea = document.querySelector('.post-textarea');
    const startDiagnosisButton = document.querySelector('.start-diagnosis-button');
    const diagnosisQuestions = document.querySelector('.diagnosis-questions');
    const likeButtons = document.querySelectorAll('.post-actions .far.fa-thumbs-up'); // いいねボタン
    const dislikeButtons = document.querySelectorAll('.post-actions .far.fa-thumbs-down'); // 良くないねボタン

    // 初期表示セクションの設定
    const initialSectionId = 'home-section';
    showSection(initialSectionId);
    setActiveLink(initialSectionId);

    // サイドバーのナビゲーションクリックイベント
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // リンクのデフォルト動作を停止

            const targetSectionId = link.dataset.section + '-section'; // data-section属性からIDを取得
            showSection(targetSectionId);
            setActiveLink(targetSectionId);
        });
    });

    // 投稿ボタンクリック時の処理 (ホームセクション内)
    if (postButton) {
        postButton.addEventListener('click', () => {
            const content = postTextarea.value.trim();

            if (content) {
                alert('投稿内容: ' + content + '\n(この投稿はまだデータベースに保存されません)');
                postTextarea.value = ''; // テキストエリアをクリア
            } else {
                alert('ハラスメントの内容を入力してください。');
            }
        });
    }

    // ハラスメント診断開始ボタンクリック時の処理
    if (startDiagnosisButton) {
        startDiagnosisButton.addEventListener('click', () => {
            diagnosisQuestions.style.display = 'block'; // 質問を表示
            startDiagnosisButton.style.display = 'none'; // ボタンを非表示
            alert('アンケート形式の診断を開始します。\n(実際にはここに質問が動的に表示されます)');
        });
    }

    // いいねボタンクリック時の処理 (UIのみ)
    likeButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('far'); // 空の親指
            button.classList.toggle('fas'); // 塗りつぶされた親指
            // カウントを増減するロジックもここに実装
        });
    });

    // 良くないねボタンクリック時の処理 (UIのみ)
    dislikeButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('far'); // 空の親指
            button.classList.toggle('fas'); // 塗りつぶされた親指
            // カウントを増減するロジックもここに実装
        });
    });

    /**
     * 指定されたIDのセクションを表示し、他のセクションを非表示にする
     * @param {string} sectionId - 表示するセクションのID
     */
    function showSection(sectionId) {
        contentSections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
    }

    /**
     * 指定されたセクションIDに対応するナビゲーションリンクにactiveクラスを付与する
     * @param {string} sectionId - activeにするセクションのID
     */
    function setActiveLink(sectionId) {
        navLinks.forEach(link => {
            if (link.dataset.section + '-section' === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
});