// ============================================
// S&J Games - Main Application
// ============================================

class SJGames {
    constructor() {
        this.currentUser = null;
        this.currentRoom = null;
        this.isAdmin = false;
        this.roomData = null;
        this.localGame = null;
        this.content = document.getElementById('content');
        this.pages = {};
        this.init();
    }

    init() {
        this.createPages();
        this.setupEventListeners();
        this.checkAuthState();
        this.loadGameData();
    }

    createPages() {
        this.pages.auth = this.createAuthPage();
        this.pages.home = this.createHomePage();
        this.pages.rooms = this.createRoomsPage();
        this.pages.gameRoom = this.createGameRoomPage();
        this.pages.localGame = this.createLocalGamePage();
        this.pages.profile = this.createProfilePage();
        
        this.content.appendChild(this.pages.auth);
        this.content.appendChild(this.pages.home);
        this.content.appendChild(this.pages.rooms);
        this.content.appendChild(this.pages.gameRoom);
        this.content.appendChild(this.pages.localGame);
        this.content.appendChild(this.pages.profile);
    }

    createAuthPage() {
        const page = document.createElement('div');
        page.id = 'auth-page';
        page.className = 'page active';
        page.innerHTML = `
            <div class="auth-container glass">
                <div class="logo">
                    <img src="assets/icons/logo.svg" alt="S&J Games" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%234d96ff%22 width=%22100%22 height=%22100%22 rx=%2220%22/%3E%3Ctext x=%2220%22 y=%2265%22 font-size=%2240%22 fill=%22white%22 font-family=%22Arial%22%3ESJ%3C/text%3E%3C/svg%3E'">
                    <h1 class="gradient-text">S&J Games</h1>
                    <p>منصة ألعاب تفاعلية مع الأصدقاء</p>
                </div>
                
                <button id="google-login-btn" class="btn btn-google btn-block btn-lg">
                    <i class="fab fa-google"></i> تسجيل الدخول بحساب Google
                </button>
                
                <div class="auth-divider">أو</div>
                
                <div class="input-group">
                    <label>البريد الإلكتروني</label>
                    <input type="email" id="login-email" placeholder="example@email.com">
                </div>
                <div class="input-group">
                    <label>كلمة المرور</label>
                    <input type="password" id="login-password" placeholder="********">
                </div>
                <button id="login-btn" class="btn btn-primary btn-block">تسجيل الدخول</button>
                
                <div style="text-align: center; margin-top: 16px;">
                    <span style="color: var(--text-secondary);">ليس لديك حساب؟</span>
                    <a href="#" id="show-register" style="color: var(--neon-blue);">إنشاء حساب</a>
                </div>
                
                <div id="register-form" style="display: none; margin-top: 20px;">
                    <div class="input-group">
                        <label>الاسم</label>
                        <input type="text" id="register-name" placeholder="اسمك">
                    </div>
                    <div class="input-group">
                        <label>البريد الإلكتروني</label>
                        <input type="email" id="register-email" placeholder="example@email.com">
                    </div>
                    <div class="input-group">
                        <label>كلمة المرور</label>
                        <input type="password" id="register-password" placeholder="********">
                    </div>
                    <button id="register-btn" class="btn btn-success btn-block">إنشاء حساب</button>
                </div>
            </div>
        `;
        return page;
    }

    createHomePage() {
        const page = document.createElement('div');
        page.id = 'home-page';
        page.className = 'page';
        page.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h2 style="font-size: 28px;">🎮 مرحباً بك في <span class="gradient-text">S&J Games</span></h2>
                    <p style="color: var(--text-secondary);">اختر لعبتك المفضلة وابدأ اللعب مع الأصدقاء</p>
                </div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <button id="create-room-btn" class="btn btn-primary">
                        <i class="fas fa-plus-circle"></i> إنشاء غرفة
                    </button>
                    <button id="join-room-btn" class="btn btn-success">
                        <i class="fas fa-sign-in-alt"></i> انضمام
                    </button>
                    <button id="local-game-btn" class="btn btn-purple">
                        <i class="fas fa-users"></i> لعب عن قرب
                    </button>
                </div>
            </div>
            
            <div class="home-grid">
                <div class="game-card" data-game="sinojem">
                    <div class="game-icon">❓</div>
                    <h3>سين وجيم</h3>
                    <p>لعبة الأسئلة والأجوبة مع قاعدة بيانات ضخمة</p>
                    <span class="game-badge">شائعة</span>
                </div>
                
                <div class="game-card" data-game="without-words">
                    <div class="game-icon">🤐</div>
                    <h3>بدون كلام</h3>
                    <p>لعبة التخمين بالإيماءات مع فريقين</p>
                    <span class="game-badge">جديدة</span>
                </div>
                
                <div class="game-card" data-game="who-am-i">
                    <div class="game-icon">🕵️</div>
                    <h3>من أنا</h3>
                    <p>لعبة تخمين الشخصيات الشهيرة</p>
                    <span class="game-badge">ممتعة</span>
                </div>
            </div>
            
            <div style="margin-top: 32px;">
                <h3 style="margin-bottom: 16px;">🏠 الغرف النشطة</h3>
                <div id="active-rooms" class="rooms-grid">
                    <p style="color: var(--text-secondary);">لا توجد غرف نشطة حالياً</p>
                </div>
            </div>
        `;
        return page;
    }

    createRoomsPage() {
        const page = document.createElement('div');
        page.id = 'rooms-page';
        page.className = 'page';
        page.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                <h2>🏠 جميع الغرف</h2>
                <button id="refresh-rooms" class="btn btn-outline btn-sm">
                    <i class="fas fa-sync"></i> تحديث
                </button>
            </div>
            <div id="all-rooms" class="rooms-grid">
                <p style="color: var(--text-secondary);">جاري تحميل الغرف...</p>
            </div>
        `;
        return page;
    }

    createGameRoomPage() {
        const page = document.createElement('div');
        page.id = 'game-room-page';
        page.className = 'page';
        page.innerHTML = `
            <div class="game-room-container">
                <div class="game-room-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <button id="back-to-home" class="btn btn-outline btn-sm">
                            <i class="fas fa-arrow-right"></i> رجوع
                        </button>
                        <h2 id="room-title">غرفة اللعب</h2>
                        <span id="room-code-display" style="font-family: 'Orbitron', cursive; font-size: 24px; color: var(--neon-yellow); letter-spacing: 3px;">####</span>
                    </div>
                    <span id="room-status-badge" style="padding: 8px 16px; border-radius: 20px; background: var(--neon-green); color: #1a1a2e;">مفتوحة</span>
                </div>
                
                <div class="game-room-layout">
                    <div>
                        <div id="game-area" style="min-height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; background: rgba(255,255,255,0.02); border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
                            <div style="text-align: center;">
                                <i class="fas fa-gamepad" style="font-size: 64px; color: var(--text-secondary);"></i>
                                <h3 style="margin-top: 16px;">انتظر بدء اللعبة</h3>
                                <p style="color: var(--text-secondary);">المشرف سيبدأ اللعبة قريباً</p>
                            </div>
                        </div>
                        
                        <div style="margin-top: 16px;">
                            <div class="chat-container">
                                <div class="chat-messages" id="chat-messages" style="display: flex; flex-direction: column;"></div>
                                <div class="chat-input">
                                    <input type="text" id="chat-input" placeholder="اكتب رسالة...">
                                    <button id="send-message-btn" class="btn btn-primary btn-sm">
                                        <i class="fas fa-paper-plane"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <div class="card">
                            <h4>👥 اللاعبين</h4>
                            <div id="players-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
                            <div id="admin-controls" style="display: none; flex-wrap: wrap; gap: 8px; margin-top: 16px;">
                                <button id="admin-start-game" class="btn btn-success btn-sm">بدء اللعبة</button>
                                <button id="admin-end-game" class="btn btn-danger btn-sm">إنهاء اللعبة</button>
                            </div>
                        </div>
                        
                        <div class="card" style="margin-top: 16px;">
                            <h4>🎙️ المكالمات</h4>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                <button id="call-audio" class="btn btn-primary btn-sm">
                                    <i class="fas fa-phone"></i> صوت
                                </button>
                                <button id="call-video" class="btn btn-success btn-sm">
                                    <i class="fas fa-video"></i> فيديو
                                </button>
                            </div>
                            <div id="jitsi-container" style="display: none; margin-top: 12px; height: 300px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return page;
    }

    createLocalGamePage() {
        const page = document.createElement('div');
        page.id = 'local-game-page';
        page.className = 'page';
        page.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto;">
                <h2 style="text-align: center;">🎮 لعب عن قرب</h2>
                <p style="text-align: center; color: var(--text-secondary);">إدخال أسماء اللاعبين والبدء فوراً</p>
                
                <div class="card" style="margin-top: 24px;">
                    <div class="input-group">
                        <label>عدد اللاعبين</label>
                        <select id="local-player-count">
                            <option value="2">2 لاعبين</option>
                            <option value="3">3 لاعبين</option>
                            <option value="4">4 لاعبين</option>
                            <option value="5">5 لاعبين</option>
                            <option value="6">6 لاعبين</option>
                        </select>
                    </div>
                    
                    <div id="local-players-input"></div>
                    
                    <div class="input-group">
                        <label>اختر اللعبة</label>
                        <select id="local-game-select">
                            <option value="sinojem">سين وجيم</option>
                            <option value="without-words">بدون كلام</option>
                            <option value="who-am-i">من أنا</option>
                        </select>
                    </div>
                    
                    <button id="start-local-game" class="btn btn-success btn-block btn-lg">
                        <i class="fas fa-play"></i> بدء اللعب
                    </button>
                </div>
            </div>
        `;
        return page;
    }

    createProfilePage() {
        const page = document.createElement('div');
        page.id = 'profile-page';
        page.className = 'page';
        page.innerHTML = `
            <div style="max-width: 500px; margin: 0 auto;">
                <div class="card" style="text-align: center;">
                    <img id="profile-avatar" src="" alt="صورة الملف الشخصي" style="width: 120px; height: 120px; border-radius: 50%; border: 3px solid var(--neon-blue); margin: 0 auto 16px; object-fit: cover;">
                    <h3 id="profile-name">المستخدم</h3>
                    <p id="profile-email" style="color: var(--text-secondary);">email@example.com</p>
                    <div style="margin-top: 16px; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                        <button id="profile-logout" class="btn btn-danger btn-sm">تسجيل الخروج</button>
                    </div>
                </div>
            </div>
        `;
        return page;
    }

    setupEventListeners() {
        // Auth
        document.addEventListener('click', (e) => {
            if (e.target.id === 'google-login-btn') this.googleLogin();
            if (e.target.id === 'login-btn') this.emailLogin();
            if (e.target.id === 'register-btn') this.emailRegister();
            if (e.target.id === 'show-register') {
                e.preventDefault();
                document.getElementById('register-form').style.display = 'block';
                e.target.style.display = 'none';
            }
        });

        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.id === 'create-room-btn') this.showCreateRoomModal();
            if (e.target.id === 'join-room-btn') this.showJoinRoomModal();
            if (e.target.id === 'local-game-btn') this.showPage('local-game-page');
            if (e.target.id === 'back-to-home') this.leaveRoom();
            if (e.target.id === 'refresh-rooms') this.loadActiveRooms();
            if (e.target.id === 'profile-logout') this.logout();
        });

        // Chat
        document.addEventListener('click', (e) => {
            if (e.target.id === 'send-message-btn') this.sendChatMessage();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && document.activeElement?.id === 'chat-input') {
                this.sendChatMessage();
            }
        });

        // Admin
        document.addEventListener('click', (e) => {
            if (e.target.id === 'admin-start-game') this.startGame();
            if (e.target.id === 'admin-end-game') this.endGame();
        });

        // Local game
        document.getElementById('local-player-count')?.addEventListener('change', () => {
            this.renderLocalPlayersInput();
        });
        document.getElementById('start-local-game')?.addEventListener('click', () => {
            this.startLocalGame();
        });
    }

    // ===== Authentication =====
    async googleLogin() {
        try {
            showToast('جاري تسجيل الدخول...', 'info');
            const result = await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
            this.currentUser = result.user;
            this.handleAuthSuccess();
        } catch (error) {
            showToast('فشل تسجيل الدخول: ' + error.message, 'error');
        }
    }

    async emailLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            const result = await firebase.auth().signInWithEmailAndPassword(email, password);
            this.currentUser = result.user;
            this.handleAuthSuccess();
        } catch (error) {
            showToast('فشل تسجيل الدخول: ' + error.message, 'error');
        }
    }

    async emailRegister() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        try {
            const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
            await result.user.updateProfile({ displayName: name });
            this.currentUser = result.user;
            this.handleAuthSuccess();
        } catch (error) {
            showToast('فشل إنشاء الحساب: ' + error.message, 'error');
        }
    }

    checkAuthState() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.handleAuthSuccess();
            } else {
                this.showPage('auth-page');
            }
        });
    }

    handleAuthSuccess() {
        this.showPage('home-page');
        this.updateNavbar();
        this.loadActiveRooms();
        this.loadUserProfile();
        this.createNavbar();
    }

    createNavbar() {
        if (document.querySelector('.navbar')) return;
        const navbar = document.createElement('nav');
        navbar.className = 'navbar';
        navbar.innerHTML = `
            <a href="#" class="navbar-brand" id="nav-home">
                <img src="assets/icons/logo.svg" alt="S&J Games" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%234d96ff%22 width=%22100%22 height=%22100%22 rx=%2220%22/%3E%3Ctext x=%2220%22 y=%2265%22 font-size=%2240%22 fill=%22white%22 font-family=%22Arial%22%3ESJ%3C/text%3E%3C/svg%3E'">
                <span>S&J Games</span>
            </a>
            <div class="navbar-actions">
                <button id="nav-rooms" class="btn btn-outline btn-sm">الغرف</button>
                <button id="nav-profile" class="btn btn-outline btn-sm">
                    <i class="fas fa-user"></i>
                </button>
                <img id="nav-avatar" src="${this.currentUser?.photoURL || ''}" alt="صورة المستخدم" class="user-avatar" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%234d96ff%22/%3E%3Ctext x=%2235%22 y=%2265%22 font-size=%2240%22 fill=%22white%22 font-family=%22Arial%22%3E${this.currentUser?.displayName?.[0] || 'U'}%3C/text%3E%3C/svg%3E'">
            </div>
        `;
        document.body.prepend(navbar);

        document.getElementById('nav-home')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('home-page');
        });
        document.getElementById('nav-rooms')?.addEventListener('click', () => {
            this.showPage('rooms-page');
            this.loadActiveRooms();
        });
        document.getElementById('nav-profile')?.addEventListener('click', () => {
            this.showPage('profile-page');
            this.loadUserProfile();
        });
    }

    updateNavbar() {
        const avatar = document.getElementById('nav-avatar');
        if (avatar && this.currentUser) {
            avatar.src = this.currentUser.photoURL || '';
        }
    }

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const page = document.getElementById(pageId);
        if (page) page.classList.add('active');
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
            showToast('تم إنشاء الغرفة بنجاح!', 'success');
        } catch (error) {
            showToast('فشل إنشاء الغرفة: ' + error.message, 'error');
        }
    }

    async joinRoom(roomCode) {
        try {
            const roomDoc = await firebase.firestore().collection('rooms').doc(roomCode).get();
            if (!roomDoc.exists) {
                showToast('الغرفة غير موجودة', 'error');
                return;
            }

            const room = roomDoc.data();
            if (room.players.length >= room.maxPlayers) {
                showToast('الغرفة ممتلئة', 'error');
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
            showToast('تم الانضمام إلى الغرفة!', 'success');
        } catch (error) {
            showToast('فشل الانضمام: ' + error.message, 'error');
        }
    }

    enterRoom(roomCode) {
        this.showPage('game-room-page');
        this.loadRoomData(roomCode);
        this.setupRoomListeners(roomCode);
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
            this.showPage('home-page');
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

        document.getElementById('room-title').textContent = this.roomData.name || 'غرفة اللعب';
        document.getElementById('room-code-display').textContent = this.roomData.code || '####';

        const badge = document.getElementById('room-status-badge');
        if (this.roomData.isPlaying) {
            badge.textContent = 'جاري اللعب';
            badge.style.background = 'var(--neon-yellow)';
        } else {
            badge.textContent = 'مفتوحة';
            badge.style.background = 'var(--neon-green)';
        }

        this.updatePlayersList();
        this.updateAdminControls();
        this.updateGameArea();
    }

    updatePlayersList() {
        const container = document.getElementById('players-list');
        if (!this.roomData || !this.roomData.players) return;

        container.innerHTML = this.roomData.players.map(player => `
            <div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                <img src="${player.photoURL || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%234d96ff%22/%3E%3Ctext x=%2235%22 y=%2265%22 font-size=%2240%22 fill=%22white%22 font-family=%22Arial%22%3E${player.name?.[0] || 'P'}%3C/text%3E%3C/svg%3E'}" style="width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--glass-border); object-fit: cover;">
                <span style="font-weight: 500;">${player.name}</span>
                ${player.uid === this.roomData.adminId ? '<span style="font-size: 11px; padding: 2px 10px; border-radius: 20px; background: var(--neon-yellow); color: #1a1a2e; font-weight: 700;">👑 مشرف</span>' : ''}
                <span style="margin-right: auto; font-size: 12px; color: var(--neon-green);">🟢 متصل</span>
                <span style="font-size: 12px; color: var(--text-secondary);">🏆 ${player.score || 0}</span>
            </div>
        `).join('');
    }

    updateAdminControls() {
        const controls = document.getElementById('admin-controls');
        if (this.isAdmin && this.roomData) {
            controls.style.display = 'flex';
        } else {
            controls.style.display = 'none';
        }
    }

    updateGameArea() {
        const area = document.getElementById('game-area');
        if (!area) return;

        if (this.roomData?.isPlaying) {
            area.innerHTML = `
                <div style="text-align: center; width: 100%;">
                    <h3>🎮 جاري اللعب</h3>
                    <p style="color: var(--text-secondary);">اللعبة قيد التقدم...</p>
                    <div id="game-content" style="margin-top: 16px;">
                        ${this.getGameContent()}
                    </div>
                </div>
            `;
        } else {
            area.innerHTML = `
                <div style="text-align: center;">
                    <i class="fas fa-gamepad" style="font-size: 64px; color: var(--text-secondary);"></i>
                    <h3 style="margin-top: 16px;">${this.isAdmin ? 'اضغط "بدء اللعبة" للبدء' : 'انتظر بدء اللعبة'}</h3>
                    <p style="color: var(--text-secondary);">${this.isAdmin ? 'أنت المشرف، يمكنك بدء اللعبة' : 'المشرف سيبدأ اللعبة قريباً'}</p>
                </div>
            `;
        }
    }

    getGameContent() {
        const game = this.roomData?.game || 'sinojem';
        switch(game) {
            case 'sinojem':
                return `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                        <span style="color: var(--neon-yellow);">السؤال: 1/10</span>
                        <span style="color: var(--neon-green);">النقاط: 0</span>
                    </div>
                    <div class="card">
                        <h4>ما هو عاصمة مصر؟</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px;">
                            <button class="btn btn-outline btn-sm">القاهرة</button>
                            <button class="btn btn-outline btn-sm">الإسكندرية</button>
                            <button class="btn btn-outline btn-sm">الجيزة</button>
                            <button class="btn btn-outline btn-sm">أسوان</button>
                        </div>
                    </div>
                `;
            case 'without-words':
                return `
                    <div style="text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🎭</div>
                        <h3 style="font-size: 32px; color: var(--neon-yellow);">تفاحة</h3>
                        <p style="color: var(--text-secondary);">🗣️ قم بوصف الكلمة بدون كلام</p>
                        <div style="display: flex; gap: 12px; justify-content: center; margin-top: 16px; flex-wrap: wrap;">
                            <button class="btn btn-success btn-sm">✅ صحيحة</button>
                            <button class="btn btn-danger btn-sm">❌ خاطئة</button>
                            <button class="btn btn-warning btn-sm">⏭️ تخطي</button>
                        </div>
                    </div>
                `;
            case 'who-am-i':
                return `
                    <div style="text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🕵️</div>
                        <h3>أنا شخصية مشهورة</h3>
                        <p style="color: var(--text-secondary);">تلميح: ممثل مصري</p>
                        <div style="display: flex; gap: 12px; justify-content: center; margin-top: 16px; flex-wrap: wrap;">
                            <input type="text" placeholder="اكتب التخمين..." style="padding: 10px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: white;">
                            <button class="btn btn-primary btn-sm">تخمين</button>
                        </div>
                    </div>
                `;
            default:
                return '<p>اختر لعبة</p>';
        }
    }

    // ===== Game Controls =====
    startGame() {
        if (!this.isAdmin) {
            showToast('أنت لست المشرف', 'error');
            return;
        }
        firebase.firestore().collection('rooms').doc(this.currentRoom).update({ isPlaying: true });
        showToast('بدأت اللعبة!', 'success');
    }

    endGame() {
        if (!this.isAdmin) {
            showToast('أنت لست المشرف', 'error');
            return;
        }
        firebase.firestore().collection('rooms').doc(this.currentRoom).update({ isPlaying: false });
        showToast('انتهت اللعبة!', 'info');
    }

    // ===== Chat =====
    async sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (!message || !this.currentRoom) return;

        const chatData = {
            uid: this.currentUser.uid,
            name: this.currentUser.displayName || 'لاعب',
            message: message,
            timestamp: Date.now()
        };

        try {
            await firebase.database().ref(`rooms/${this.currentRoom}/chat`).push(chatData);
            input.value = '';
        } catch (error) {
            showToast('فشل إرسال الرسالة: ' + error.message, 'error');
        }
    }

    // ===== Local Game =====
    renderLocalPlayersInput() {
        const container = document.getElementById('local-players-input');
        const count = parseInt(document.getElementById('local-player-count').value);
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
        this.showPage('game-room-page');
        
        document.getElementById('room-title').textContent = '🎮 لعب عن قرب';
        document.getElementById('room-code-display').textContent = 'LOCAL';
        document.getElementById('room-status-badge').textContent = 'جاري الل
