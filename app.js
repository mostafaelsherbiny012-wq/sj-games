// ============================================
// S&J Games - Main Application
// ============================================

// ===== Sound Manager =====
class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.init();
    }

    init() {
        const soundFiles = {
            click: 'click.mp3',
            win: 'win.mp3',
            correct: 'correct.mp3',
            wrong: 'wrong.mp3',
            notification: 'notification.mp3'
        };

        Object.keys(soundFiles).forEach(key => {
            const audio = new Audio(`assets/sounds/${soundFiles[key]}`);
            audio.load();
            this.sounds[key] = audio;
        });
    }

    play(name) {
        if (!this.enabled) return;
        try {
            const sound = this.sounds[name];
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(() => {});
            }
        } catch (e) {}
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// ===== Toast System =====
function showToast(message, type = 'info', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
        <div class="toast-progress"></div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
        const progress = toast.querySelector('.toast-progress');
        if (progress) {
            progress.style.animationDuration = `${duration}ms`;
        }
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ===== Confetti =====
function showConfetti() {
    const colors = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 99999;
    `;
    document.body.appendChild(container);

    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 8 + 4;
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = Math.random() * 2 + 2;

        confetti.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size * 2}px;
            background: ${color};
            border-radius: 2px;
            left: ${left}%;
            top: -10%;
            animation: confettiFall ${duration}s ease-in ${delay}s forwards;
            transform: rotate(${Math.random() * 360}deg);
        `;
        container.appendChild(confetti);
    }

    setTimeout(() => container.remove(), 4000);
}

// ===== Main App =====
class SJGames {
    constructor() {
        this.currentUser = null;
        this.currentRoom = null;
        this.isAdmin = false;
        this.roomData = null;
        this.localGame = null;
        this.currentPage = 'auth';
        this.sound = new SoundManager();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.checkAuthState();
        this.setupSW();
        this.renderLocalPlayersInput();
        this.setupInstallPrompt();
        this.loadGameData();

        // Add confetti animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes confettiFall {
                0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
                100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // ===== Setup Event Listeners =====
    setupEventListeners() {
        // Auth
        document.addEventListener('click', (e) => {
            if (e.target.id === 'google-login-btn') this.googleLogin();
            if (e.target.id === 'login-btn') this.emailLogin();
            if (e.target.id === 'register-btn') this.emailRegister();
            if (e.target.id === 'show-register') {
                e.preventDefault();
                const form = document.getElementById('register-form');
                form.style.display = form.style.display === 'none' ? 'block' : 'none';
                e.target.textContent = form.style.display === 'none' ? 'إنشاء حساب' : 'إلغاء';
            }
        });

        // Global click sound
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn')) {
                this.sound.play('click');
            }
        });

        // Chat enter key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && document.activeElement?.id === 'chat-input') {
                this.sendMessage();
            }
            if (e.key === 'Enter' && document.activeElement?.id === 'whoami-guess') {
                const btn = document.querySelector('#whoami-guess + .btn');
                if (btn) btn.click();
            }
        });

        // Local player count change
        document.getElementById('local-player-count')?.addEventListener('change', () => {
            this.renderLocalPlayersInput();
        });
    }

    // ===== Navigation =====
    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                if (page === 'auth' || page === 'mode') return;
                this.showPage(page);
            });
        });
    }

    showPage(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        const target = document.getElementById(`page-${page}`);
        if (target) {
            target.classList.add('active');
            target.style.animation = 'none';
            requestAnimationFrame(() => {
                target.style.animation = 'pageFade 0.4s ease';
            });
        }

        this.currentPage = page;

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        const nav = document.querySelector('.bottom-nav');
        if (nav) {
            const hiddenPages = ['auth', 'mode'];
            nav.style.display = hiddenPages.includes(page) ? 'none' : 'flex';
        }

        if (page === 'rooms') {
            this.loadActiveRooms();
        }

        if (page === 'profile') {
            this.loadUserProfile();
        }
    }

    // ===== Mode Selection =====
    selectMode(mode) {
        if (mode === 'online') {
            this.showPage('home');
            showToast('🌐 تم اختيار اللعب عن بعد', 'success');
        } else {
            this.showPage('local');
            showToast('📱 تم اختيار اللعب عن قرب', 'success');
        }
    }

    // ===== Authentication =====
    async googleLogin() {
        try {
            showToast('جاري تسجيل الدخول...', 'info');
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await firebase.auth().signInWithPopup(provider);
            this.currentUser = result.user;
            this.handleAuthSuccess();
        } catch (error) {
            console.error('Google login error:', error);
            if (error.code === 'auth/popup-blocked') {
                showToast('الرجاء السماح للنوافذ المنبثقة', 'warning');
            } else if (error.code === 'auth/unauthorized-domain') {
                showToast('هذا النطاق غير مصرح به في Firebase', 'error');
            } else if (error.code === 'auth/operation-not-allowed') {
                showToast('تسجيل الدخول بجوجل غير مفعل في Firebase', 'error');
            } else {
                showToast('فشل تسجيل الدخول: ' + error.message, 'error');
            }
        }
    }

    async emailLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        if (!email || !password) {
            showToast('الرجاء إدخال البريد وكلمة المرور', 'warning');
            return;
        }
        try {
            const result = await firebase.auth().signInWithEmailAndPassword(email, password);
            this.currentUser = result.user;
            this.handleAuthSuccess();
        } catch (error) {
            console.error('Email login error:', error);
            if (error.code === 'auth/user-not-found') {
                showToast('المستخدم غير موجود', 'error');
            } else if (error.code === 'auth/wrong-password') {
                showToast('كلمة المرور غير صحيحة', 'error');
            } else {
                showToast('فشل تسجيل الدخول: ' + error.message, 'error');
            }
        }
    }

    async emailRegister() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        if (!name || !email || !password) {
            showToast('الرجاء ملء جميع الحقول', 'warning');
            return;
        }
        try {
            const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
            await result.user.updateProfile({ displayName: name });
            this.currentUser = result.user;
            this.handleAuthSuccess();
        } catch (error) {
            console.error('Register error:', error);
            if (error.code === 'auth/email-already-in-use') {
                showToast('البريد الإلكتروني مستخدم بالفعل', 'error');
            } else if (error.code === 'auth/weak-password') {
                showToast('كلمة المرور ضعيفة جداً', 'error');
            } else {
                showToast('فشل إنشاء الحساب: ' + error.message, 'error');
            }
        }
    }

    checkAuthState() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.handleAuthSuccess();
            } else {
                this.currentUser = null;
                this.showPage('auth');
                const nav = document.querySelector('.bottom-nav');
                if (nav) nav.style.display = 'none';
            }
        });
    }

    handleAuthSuccess() {
        this.showPage('mode');
        this.updateUserUI();
        this.loadActiveRooms();
        this.loadUserProfile();
        showToast(`🎮 مرحباً ${this.currentUser.displayName || 'اللاعب'}`, 'success');
    }

    updateUserUI() {
        const avatar = document.getElementById('profile-avatar-img');
        const name = document.getElementById('profile-name');
        const email = document.getElementById('profile-email');
        if (avatar) avatar.src = this.currentUser?.photoURL || 'assets/icons/default-avatar.png';
        if (name) name.textContent = this.currentUser?.displayName || 'اللاعب';
        if (email) email.textContent = this.currentUser?.email || '';
    }

    // ===== Rooms =====
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    async createRoom(roomData) {
        if (!this.currentUser) {
            showToast('الرجاء تسجيل الدخول أولاً', 'warning');
            return;
        }
        try {
            const roomCode = this.generateRoomCode();
            const room = {
                code: roomCode,
                name: roomData.name || 'غرفة جديدة',
                game: roomData.game || 'sinojem',
                isPlaying: false,
                adminId: this.currentUser.uid,
                adminName: this.currentUser.displayName || 'المشرف',
                players: [{
                    uid: this.currentUser.uid,
                    name: this.currentUser.displayName || 'لاعب',
                    photoURL: this.currentUser.photoURL || '',
                    score: 0
                }],
                maxPlayers: roomData.maxPlayers || 8,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await firebase.firestore().collection('rooms').doc(roomCode).set(room);
            this.currentRoom = roomCode;
            this.isAdmin = true;
            this.enterRoom(roomCode);
            showToast('✅ تم إنشاء الغرفة بنجاح!', 'success');
        } catch (error) {
            showToast('فشل إنشاء الغرفة: ' + error.message, 'error');
        }
    }

    async joinRoom(roomCode) {
        if (!this.currentUser) {
            showToast('الرجاء تسجيل الدخول أولاً', 'warning');
            return;
        }
        try {
            const roomDoc = await firebase.firestore().collection('rooms').doc(roomCode).get();
            if (!roomDoc.exists) {
                showToast('❌ الغرفة غير موجودة', 'error');
                return;
            }

            const room = roomDoc.data();
            if (room.players.length >= room.maxPlayers) {
                showToast('❌ الغرفة ممتلئة', 'error');
                return;
            }

            const player = {
                uid: this.currentUser.uid,
                name: this.currentUser.displayName || 'لاعب',
                photoURL: this.currentUser.photoURL || '',
                score: 0
            };

            await firebase.firestore().collection('rooms').doc(roomCode).update({
                players: firebase.firestore.FieldValue.arrayUnion(player)
            });

            this.currentRoom = roomCode;
            this.isAdmin = false;
            this.enterRoom(roomCode);
            showToast('✅ تم الانضمام إلى الغرفة!', 'success');
        } catch (error) {
            showToast('فشل الانضمام: ' + error.message, 'error');
        }
    }

    enterRoom(roomCode) {
        this.showPage('game');
        this.loadRoomData(roomCode);
        this.setupRoomListeners(roomCode);
        document.getElementById('game-title').textContent = 'غرفة اللعب';
        document.getElementById('game-status').textContent = 'مفتوحة';
        document.getElementById('game-status').className = 'badge badge-success';
    }

    async leaveRoom() {
        if (!this.currentRoom) return;
        try {
            const roomRef = firebase.firestore().collection('rooms').doc(this.currentRoom);
            const roomDoc = await roomRef.get();
            const room = roomDoc.data();
            const updatedPlayers = room.players.filter(p => p.uid !== this.currentUser.uid);

            if (updatedPlayers.length === 0) {
                await roomRef.delete();
            } else {
                await roomRef.update({ players: updatedPlayers });
                if (this.isAdmin && updatedPlayers.length > 0) {
                    await roomRef.update({ adminId: updatedPlayers[0].uid, adminName: updatedPlayers[0].name });
                }
            }

            this.currentRoom = null;
            this.isAdmin = false;
            this.showPage('home');
            this.loadActiveRooms();
            showToast('تم الخروج من الغرفة', 'info');
        } catch (error) {
            showToast('فشل الخروج: ' + error.message, 'error');
        }
    }

    async loadRoomData(roomCode) {
        try {
            const roomDoc = await firebase.firestore().collection('rooms').doc(roomCode).get();
            if (roomDoc.exists) {
                this.roomData = roomDoc.data();
                this.updateRoomUI();
            }
        } catch (error) {
            console.error('Error loading room:', error);
        }
    }

    setupRoomListeners(roomCode) {
        if (this.roomUnsubscribe) this.roomUnsubscribe();
        this.roomUnsubscribe = firebase.firestore().collection('rooms').doc(roomCode)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    this.roomData = doc.data();
                    this.updateRoomUI();
                }
            });
    }

    updateRoomUI() {
        if (!this.roomData) return;

        const badge = document.getElementById('game-status');
        if (this.roomData.isPlaying) {
            badge.textContent = 'جاري اللعب';
            badge.className = 'badge badge-warning';
        } else {
            badge.textContent = 'مفتوحة';
            badge.className = 'badge badge-success';
        }

        this.updatePlayersList();
    }

    updatePlayersList() {
        const container = document.getElementById('players-list');
        if (!container || !this.roomData || !this.roomData.players) return;

        container.innerHTML = this.roomData.players.map(player => `
            <div style="display:flex; align-items:center; gap:12px; padding:10px 14px; background:rgba(255,255,255,0.03); border-radius:10px; border:1px solid ${player.uid === this.currentUser?.uid ? 'var(--primary)' : 'var(--glass-border)'};">
                <img src="${player.photoURL || 'assets/icons/default-avatar.png'}" 
                     style="width:36px; height:36px; border-radius:50%; object-fit:cover; border:2px solid var(--primary);"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%234F46E5%22/%3E%3Ctext x=%2235%22 y=%2265%22 font-size=%2240%22 fill=%22white%22 font-family=%22Arial%22%3E${player.name?.[0] || 'P'}%3C/text%3E%3C/svg%3E'">
                <span style="font-weight:500; flex:1;">${player.name}</span>
                ${player.uid === this.roomData.adminId ? '<span style="font-size:11px; padding:2px 10px; border-radius:20px; background:var(--warning); color:#1a1a2e; font-weight:700;">👑 مشرف</span>' : ''}
                <span style="font-size:12px; color:var(--text-secondary);">🏆 ${player.score || 0}</span>
            </div>
        `).join('');
    }

    // ===== Chat =====
    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input?.value.trim();
        if (!message || !this.currentRoom || !this.currentUser) return;

        const chatData = {
            uid: this.currentUser.uid,
            name: this.currentUser.displayName || 'لاعب',
            photoURL: this.currentUser.photoURL || '',
            message: message,
            timestamp: Date.now()
        };

        try {
            await firebase.database().ref(`rooms/${this.currentRoom}/chat`).push(chatData);
            input.value = '';
            this.displayChatMessage(chatData);
        } catch (error) {
            showToast('فشل إرسال الرسالة: ' + error.message, 'error');
        }
    }

    displayChatMessage(data) {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        const isOwn = data.uid === this.currentUser?.uid;
        const time = new Date(data.timestamp).toLocaleTimeString('ar-EG');

        const div = document.createElement('div');
        div.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: ${isOwn ? 'flex-end' : 'flex-start'};
            margin-bottom: 8px;
            max-width: 85%;
            align-self: ${isOwn ? 'flex-end' : 'flex-start'};
        `;
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:2px;">
                <img src="${data.photoURL || 'assets/icons/default-avatar.png'}" 
                     style="width:24px; height:24px; border-radius:50%; object-fit:cover;"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%234F46E5%22/%3E%3Ctext x=%2235%22 y=%2265%22 font-size=%2240%22 fill=%22white%22 font-family=%22Arial%22%3E${data.name?.[0] || 'P'}%3C/text%3E%3C/svg%3E'">
                <span style="font-size:12px; font-weight:600; color:var(--secondary);">${data.name}</span>
                <span style="font-size:10px; color:var(--text-muted);">${time}</span>
            </div>
            <div style="background:${isOwn ? 'var(--primary)' : 'var(--bg-card)'}; padding:8px 14px; border-radius:12px; ${isOwn ? 'border-bottom-right-radius:4px;' : 'border-bottom-left-radius:4px;'}">
                <span style="font-size:14px;">${data.message}</span>
            </div>
        `;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    // ===== Games =====
    playGame(gameId) {
        if (!this.currentUser) {
            showToast('الرجاء تسجيل الدخول أولاً', 'warning');
            return;
        }
        this.showPage('game');
        document.getElementById('game-title').textContent = this.getGameTitle(gameId);
        document.getElementById('game-status').textContent = 'جاري';
        document.getElementById('game-status').className = 'badge badge-warning';
        this.loadGameContent(gameId);
    }

    getGameTitle(id) {
        const titles = {
            'sinojem': '❓ سين وجيم',
            'without-words': '🤐 بدون كلام',
            'who-am-i': '🕵️ من أنا'
        };
        return titles[id] || 'اللعبة';
    }

    loadGameContent(gameId) {
        const area = document.getElementById('game-area');
        if (!area) return;
        switch (gameId) {
            case 'sinojem':
                this.renderSinojemGame(area);
                break;
            case 'without-words':
                this.renderWithoutWordsGame(area);
                break;
            case 'who-am-i':
                this.renderWhoAmIGame(area);
                break;
            default:
                area.innerHTML = `<div class="game-placeholder"><i class="fas fa-gamepad"></i><h3>لعبة غير متوفرة</h3></div>`;
        }
    }

    renderSinojemGame(area) {
        const questions = [
            { q: 'ما هو عاصمة مصر؟', options: ['القاهرة', 'الإسكندرية', 'الجيزة', 'أسوان'], a: 'القاهرة' },
            { q: 'كم عدد الكواكب في المجموعة الشمسية؟', options: ['7', '8', '9', '10'], a: '8' },
            { q: 'ما هي أكبر قارة في العالم؟', options: ['آسيا', 'أفريقيا', 'أمريكا', 'أوروبا'], a: 'آسيا' },
            { q: 'من هو مؤلف رواية "مئة عام من العزلة"؟', options: ['ماركيز', 'همنغواي', 'توين', 'ديكنز'], a: 'ماركيز' },
            { q: 'ما هو أطول نهر في العالم؟', options: ['النيل', 'الأمازون', 'اليانغتسي', 'الميسيسيبي'], a: 'النيل' }
        ];

        let current = 0;
        let score = 0;

        const renderQuestion = () => {
            if (current >= questions.length) {
                this.showGameResult(area, score, questions.length);
                return;
            }

            const q = questions[current];
            area.innerHTML = `
                <div class="question-container" style="max-width:600px; margin:0 auto;">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                        <div style="flex:1; height:4px; background:var(--glass-border); border-radius:4px; overflow:hidden;">
                            <div style="width:${(current / questions.length) * 100}%; height:100%; background:linear-gradient(90deg, var(--primary), var(--secondary)); border-radius:4px;"></div>
                        </div>
                        <span style="font-size:14px; color:var(--text-secondary);">${current + 1}/${questions.length}</span>
                    </div>
                    <div class="question-card glass" style="padding:24px; text-align:center;">
                        <h3 style="font-family:'Tajawal', sans-serif; font-size:20px; margin-bottom:20px;">${q.q}</h3>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                            ${q.options.map(opt => `
                                <button class="btn btn-outline option-btn" onclick="window.app.checkAnswer(this, '${opt}', '${q.a}')" style="padding:16px; font-size:16px;">
                                    ${opt}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <div style="text-align:center; margin-top:16px; font-family:'Orbitron', cursive; color:var(--secondary);">⭐ ${score}</div>
                </div>
            `;
        };

        window.checkAnswer = (btn, answer, correct) => {
            const isCorrect = answer === correct;
            const allBtns = btn.parentElement.querySelectorAll('.option-btn');

            allBtns.forEach(b => b.disabled = true);

            if (isCorrect) {
                score += 10;
                btn.classList.add('correct');
                this.sound.play('correct');
                showConfetti();
                showToast('✅ إجابة صحيحة! +10 نقاط', 'success');
            } else {
                btn.classList.add('wrong');
                this.sound.play('wrong');
                allBtns.forEach(b => {
                    if (b.textContent === correct) b.classList.add('correct');
                });
                showToast(`❌ الإجابة الصحيحة: ${correct}`, 'error');
            }

            current++;
            setTimeout(renderQuestion, 1500);
        };

        renderQuestion();
    }

    renderWithoutWordsGame(area) {
        const words = ['تفاحة', 'سيارة', 'بيت', 'شمس', 'قمر', 'نجم', 'وردة', 'نهر', 'جبل', 'كتاب'];
        let current = 0;
        let score = 0;

        const renderWord = () => {
            if (current >= words.length) {
                this.showGameResult(area, score, words.length);
                return;
            }

            const word = words[current];
            area.innerHTML = `
                <div style="text-align:center; padding:20px;">
                    <div class="glass" style="padding:32px;">
                        <div style="font-size:48px; margin-bottom:16px;">🎭</div>
                        <h3 style="font-size:48px; color:var(--secondary);">${word}</h3>
                        <p style="color:var(--text-secondary);">🗣️ قم بوصف الكلمة بدون كلام</p>
                        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:16px;">
                            <button class="btn btn-success" onclick="window.app.wordCorrect()"><i class="fas fa-check"></i> صحيحة</button>
                            <button class="btn btn-danger" onclick="window.app.wordWrong()"><i class="fas fa-times"></i> خاطئة</button>
                            <button class="btn btn-warning" onclick="window.app.wordSkip()"><i class="fas fa-forward"></i> تخطي</button>
                        </div>
                        <div style="margin-top:16px; font-family:'Orbitron', cursive; color:var(--secondary);">⭐ ${score}</div>
                    </div>
                </div>
            `;
        };

        window.wordCorrect = () => {
            score += 5;
            this.sound.play('correct');
            showToast('✅ +5 نقاط', 'success');
            current++;
            renderWord();
        };

        window.wordWrong = () => {
            this.sound.play('wrong');
            showToast('❌ إجابة خاطئة', 'error');
            current++;
            renderWord();
        };

        window.wordSkip = () => {
            current++;
            renderWord();
        };

        renderWord();
    }

    renderWhoAmIGame(area) {
        const characters = [
            { name: 'أحمد زكي', hint: 'ممثل مصري لقب بالأسطورة' },
            { name: 'جيف بيزوس', hint: 'رجل أعمال ومؤسس شركة عالمية' },
            { name: 'نيل أرمسترونغ', hint: 'أول رائد فضاء مشى على القمر' },
            { name: 'ليوناردو دافينشي', hint: 'رسام ومخترع إيطالي' },
            { name: 'ألبرت أينشتاين', hint: 'عالم فيزياء ألماني' }
        ];

        let current = 0;
        let score = 0;

        const renderCharacter = () => {
            if (current >= characters.length) {
                this.showGameResult(area, score, characters.length);
                return;
            }

            const char = characters[current];
            area.innerHTML = `
                <div style="text-align:center; padding:20px; max-width:500px; margin:0 auto;">
                    <div class="glass" style="padding:32px;">
                        <div style="font-size:48px; margin-bottom:16px;">🕵️</div>
                        <h3 style="font-family:'Tajawal', sans-serif; font-size:24px;">من أنا؟</h3>
                        <p style="color:var(--text-secondary); font-size:18px; margin:16px 0;">${char.hint}</p>
                        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
                            <input type="text" id="whoami-guess" placeholder="اكتب التخمين..." style="flex:1; min-width:150px; padding:10px 14px; background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); border-radius:var(--radius-md); color:var(--text-primary); outline:none;">
                            <button class="btn btn-primary" onclick="window.app.checkWhoAmI('${char.name}')"><i class="fas fa-search"></i> تخمين</button>
                        </div>
                        <div style="margin-top:16px; font-family:'Orbitron', cursive; color:var(--secondary);">⭐ ${score}</div>
                    </div>
                </div>
            `;
        };

        window.checkWhoAmI = (correctName) => {
            const input = document.getElementById('whoami-guess');
            if (!input) return;
            const guess = input.value.trim();

            if (guess.toLowerCase() === correctName.toLowerCase()) {
                score += 15;
                this.sound.play('correct');
                showConfetti();
                showToast('✅ تخمين صحيح! +15 نقاط', 'success');
                current++;
                setTimeout(renderCharacter, 1000);
            } else {
                this.sound.play('wrong');
                showToast(`❌ الإجابة الصحيحة: ${correctName}`, 'error');
                input.value = '';
            }
        };

        renderCharacter();
    }

    showGameResult(area, score, total) {
        const percent = Math.round((score / (total * 10)) * 100);
        const grade = percent >= 80 ? 'ممتاز! 🌟' : percent >= 60 ? 'جيد جداً! 👍' : 'حاول مرة أخرى! 💪';

        area.innerHTML = `
            <div style="text-align:center; padding:40px 24px; max-width:400px; margin:0 auto;">
                <div class="glass" style="padding:32px;">
                    <div style="font-size:64px; margin-bottom:16px;">${percent >= 80 ? '🏆' : '🎯'}</div>
                    <h2 style="font-family:'Tajawal', sans-serif; font-size:28px;">${grade}</h2>
                    <p style="color:var(--text-secondary); font-size:18px;">النقاط: ${score} من ${total * 10}</p>
                    <div style="width:100%; height:6px; background:var(--glass-border); border-radius:4px; margin:16px 0; overflow:hidden;">
                        <div style="width:${percent}%; height:100%; background:linear-gradient(90deg, var(--primary), var(--secondary)); border-radius:4px;"></div>
                    </div>
                    <button class="btn btn-primary" onclick="window.app.showPage('home')"><i class="fas fa-home"></i> العودة للرئيسية</button>
                </div>
            </div>
        `;

        if (percent >= 80) {
            showConfetti();
        }
    }

    // ===== Local Game =====
    renderLocalPlayersInput() {
        const container = document.getElementById('local-players-input');
        if (!container) return;
        const count = parseInt(document.getElementById('local-player-count')?.value || 2);
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const div = document.createElement('div');
            div.className = 'input-group';
            div.innerHTML = `
                <label>اللاعب ${i + 1}</label>
                <input type="text" class="local-player-name" placeholder="اسم اللاعب ${i + 1}" value="لاعب ${i + 1}">
            `;
            container.appendChild(div);
        }
    }

    startLocalGame() {
        const inputs = document.querySelectorAll('.local-player-name');
        const players = [];
        const names = new Set();

        inputs.forEach(input => {
            const name = input.value.trim() || 'لاعب';
            if (!names.has(name)) {
                names.add(name);
                players.push({ name, score: 0 });
            }
        });

        if (players.length < 2) {
            showToast('يجب إدخال اسمين على الأقل', 'error');
            return;
        }

        const game = document.getElementById('local-game-select').value;
        this.localGame = { players, game, currentPlayer: 0 };
        this.showPage('game');

        document.getElementById('game-title').textContent = '🎮 لعب عن قرب';
        document.getElementById('game-status').textContent = 'جاري';
        document.getElementById('game-status').className = 'badge badge-warning';

        this.renderLocalGame();
    }

    renderLocalGame() {
        const area = document.getElementById('game-area');
        if (!area || !this.localGame) return;
        const player = this.localGame.players[this.localGame.currentPlayer];

        area.innerHTML = `
            <div style="width:100%;">
                <div style="display:flex; flex-wrap:wrap; gap:12px; justify-content:center; margin-bottom:20px;">
                    ${this.localGame.players.map((p, i) => `
                        <div style="background:var(--bg-glass); border-radius:var(--radius-md); padding:12px 16px; text-align:center; min-width:80px; border:2px solid ${i === this.localGame.currentPlayer ? 'var(--secondary)' : 'transparent'}; box-shadow: ${i === this.localGame.currentPlayer ? '0 0 20px rgba(6,182,212,0.2)' : 'none'};">
                            <div style="width:40px; height:40px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; margin:0 auto 4px; font-weight:700; font-size:18px;">${p.name[0]}</div>
                            <span style="font-size:14px;">${p.name}</span>
                            <span style="display:block; font-family:'Orbitron', cursive; font-size:18px; color:var(--secondary);">${p.score}</span>
                            ${i === this.localGame.currentPlayer ? '<span style="font-size:11px; color:var(--secondary);">🎯 دوره</span>' : ''}
                        </div>
                    `).join('')}
                </div>
                <div style="text-align:center;">
                    <h3 style="font-family:'Tajawal', sans-serif; font-size:20px; margin-bottom:16px;">دور: ${player.name}</h3>
                    ${this.getLocalGameContent()}
                </div>
            </div>
        `;
    }

    getLocalGameContent() {
        const game = this.localGame?.game || 'sinojem';

        switch (game) {
            case 'sinojem':
                const questions = [
                    { q: 'ما هو عاصمة مصر؟', options: ['القاهرة', 'الإسكندرية', 'الجيزة', 'أسوان'], a: 'القاهرة' },
                    { q: 'كم عدد الكواكب في المجموعة الشمسية؟', options: ['7', '8', '9', '10'], a: '8' }
                ];
                const q = questions[this.localGame.currentPlayer % questions.length];
                return `
                    <div class="glass" style="padding:24px;">
                        <h4 style="font-family:'Tajawal', sans-serif; font-size:20px; margin-bottom:16px;">${q.q}</h4>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                            ${q.options.map(opt => `
                                <button class="btn btn-outline option-btn" onclick="window.app.localAnswer('${opt}', '${q.a}')">${opt}</button>
                            `).join('')}
                        </div>
                    </div>
                `;
            case 'without-words':
                const words = ['تفاحة', 'سيارة', 'بيت', 'شمس', 'قمر'];
                const word = words[this.localGame.currentPlayer % words.length];
                return `
                    <div style="padding:20px;">
                        <div style="font-size:48px; margin-bottom:16px;">🎭</div>
                        <h3 style="font-size:48px; color:var(--secondary);">${word}</h3>
                        <p style="color:var(--text-secondary);">🗣️ صف الكلمة بدون كلام</p>
                        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:16px;">
                            <button class="btn btn-success" onclick="window.app.localCorrect()">✅ صحيحة</button>
                            <button class="btn btn-danger" onclick="window.app.localWrong()">❌ خاطئة</button>
                            <button class="btn btn-warning" onclick="window.app.localSkip()">⏭️ تخطي</button>
                        </div>
                    </div>
                `;
            case 'who-am-i':
                const characters = [
                    { name: 'أحمد زكي', hint: 'ممثل مصري' },
                    { name: 'جيف بيزوس', hint: 'رجل أعمال' }
                ];
                const char = characters[this.localGame.currentPlayer % characters.length];
                return `
                    <div style="padding:20px;">
                        <p style="color:var(--text-secondary); font-size:18px;">${char.hint}</p>
                        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:16px;">
                            <input type="text" id="local-whoami-guess" placeholder="من أنا؟" style="flex:1; min-width:150px; padding:10px 14px; background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); border-radius:var(--radius-md); color:var(--text-primary); outline:none;">
                            <button class="btn btn-primary" onclick="window.app.localWhoAmI('${char.name}')">تخمين</button>
                        </div>
                    </div>
                `;
            default:
                return '<p>اختر لعبة</p>';
        }
    }

    localAnswer(answer, correct) {
        if (answer === correct) {
            this.localCorrect();
        } else {
            this.localWrong();
        }
    }

    localCorrect() {
        this.localGame.players[this.localGame.currentPlayer].score += 10;
        this.sound.play('correct');
        showToast('✅ +10 نقاط', 'success');
        this.nextLocalTurn();
    }

    localWrong() {
        this.sound.play('wrong');
        showToast('❌ إجابة خاطئة', 'error');
        this.nextLocalTurn();
    }

    localSkip() {
        this.nextLocalTurn();
    }

    localWhoAmI(correctName) {
        const input = document.getElementById('local-whoami-guess');
        if (!input) return;
        if (input.value.trim().toLowerCase() === correctName.toLowerCase()) {
            this.localCorrect();
        } else {
            this.localWrong();
        }
        input.value = '';
    }

    nextLocalTurn() {
        this.localGame.currentPlayer = (this.localGame.currentPlayer + 1) % this.localGame.players.length;
        this.renderLocalGame();
        this.sound.play('notification');
    }

    // ===== Profile =====
    async loadUserProfile() {
        if (!this.currentUser) return;
        const avatar = document.getElementById('profile-avatar-img');
        const name = document.getElementById('profile-name');
        const email = document.getElementById('profile-email');
        if (avatar) avatar.src = this.currentUser.photoURL || 'assets/icons/default-avatar.png';
        if (name) name.textContent = this.currentUser.displayName || 'اللاعب';
        if (email) email.textContent = this.currentUser.email || '';

        try {
            const doc = await firebase.firestore().collection('users').doc(this.currentUser.uid).get();
            const data = doc.data();
            document.getElementById('stat-games').textContent = data?.stats?.games || 0;
            document.getElementById('stat-wins').textContent = data?.stats?.wins || 0;
            document.getElementById('stat-points').textContent = data?.stats?.points || 0;
        } catch (e) {}
    }

    // ===== Rooms Loading =====
    async loadActiveRooms() {
        try {
            const snapshot = await firebase.firestore().collection('rooms')
                .where('isPlaying', '==', false)
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();

            const containers = document.querySelectorAll('#active-rooms, #all-rooms');
            containers.forEach(container => {
                if (!container) return;
                if (snapshot.empty) {
                    container.innerHTML = '<p style="color:var(--text-secondary); text-align:center; padding:20px;">لا توجد غرف نشطة حالياً</p>';
                    return;
                }

                container.innerHTML = snapshot.docs.map(doc => {
                    const room = doc.data();
                    return `
                        <div class="room-card" onclick="window.app.joinRoom('${doc.id}')">
                            <div class="room-header">
                                <span class="room-code">${doc.id}</span>
                                <span class="badge badge-success">مفتوحة</span>
                            </div>
                            <h4 style="font-family:'Tajawal', sans-serif;">${room.name || 'غرفة جديدة'}</h4>
                            <p>🎮 ${room.game || 'سين وجيم'}</p>
                            <div style="display:flex; align-items:center; gap:8px; color:var(--text-secondary); font-size:14px;">
                                <span>👥 ${room.players ? room.players.length : 0}/${room.maxPlayers || 8}</span>
                                <span>|</span>
                                <span>👑 ${room.adminName || 'المشرف'}</span>
                            </div>
                        </div>
                    `;
                }).join('');
            });
        } catch (error) {
            console.error('Error loading rooms:', error);
        }
    }

    // ===== Modals =====
    showCreateRoom() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal glass">
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                <h3 style="margin-bottom:16px; font-family:'Tajawal', sans-serif;">🚀 إنشاء غرفة جديدة</h3>
                <div class="input-group">
                    <label>اسم الغرفة</label>
                    <input type="text" id="create-room-name" placeholder="اسم الغرفة" value="غرفة سين وجيم">
                </div>
                <div class="input-group">
                    <label>اللعبة</label>
                    <select id="create-room-game">
                        <option value="sinojem">سين وجيم</option>
                        <option value="without-words">بدون كلام</option>
                        <option value="who-am-i">من أنا</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>عدد اللاعبين الأقصى</label>
                    <select id="create-room-max">
                        <option value="4">4</option>
                        <option value="6">6</option>
                        <option value="8" selected>8</option>
                        <option value="10">10</option>
                    </select>
                </div>
                <button class="btn btn-primary btn-block" onclick="window.app.createRoomFromModal()">إنشاء الغرفة</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    createRoomFromModal() {
        const name = document.getElementById('create-room-name').value;
        const game = document.getElementById('create-room-game').value;
        const maxPlayers = parseInt(document.getElementById('create-room-max').value);
        this.createRoom({ name, game, maxPlayers });
        document.querySelector('.modal-overlay')?.remove();
    }

    showJoinRoom() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal glass">
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                <h3 style="margin-bottom:16px; font-family:'Tajawal', sans-serif;">🔑 الانضمام إلى غرفة</h3>
                <div class="input-group">
                    <label>كود الغرفة</label>
                    <input type="text" id="join-room-code" placeholder="مثال: ABC123" style="text-transform:uppercase; text-align:center; font-size:24px; letter-spacing:4px;">
                </div>
                <button class="btn btn-success btn-block" onclick="window.app.joinRoomFromModal()">انضمام</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    joinRoomFromModal() {
        const code = document.getElementById('join-room-code').value.toUpperCase().trim();
        if (!code) {
            showToast('الرجاء إدخال كود الغرفة', 'error');
            return;
        }
        this.joinRoom(code);
        document.querySelector('.modal-overlay')?.remove();
    }

    // ===== Logout =====
    logout() {
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            if (this.currentRoom) {
                this.leaveRoom();
            }
            firebase.auth().signOut();
            this.currentUser = null;
            this.showPage('auth');
            const nav = document.querySelector('.bottom-nav');
            if (nav) nav.style.display = 'none';
            showToast('تم تسجيل الخروج', 'info');
        }
    }

    // ===== Service Worker =====
    setupSW() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(reg => console.log('✅ SW registered:', reg))
                    .catch(err => console.log('❌ SW registration failed:', err));
            });
        }
    }

    // ===== Install Prompt =====
    setupInstallPrompt() {
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
        });
    }

    // ===== Game Data =====
    loadGameData() {
        fetch('database/sinojem.json').catch(() => console.log('Using default data'));
        fetch('database/without-words.json').catch(() => console.log('Using default data'));
        fetch('database/who-am-i.json').catch(() => console.log('Using default data'));
    }
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SJGames();
});
