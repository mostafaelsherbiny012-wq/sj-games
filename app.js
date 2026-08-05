// ============================================
// S&J Games - Main Application
// Professional Offline-First PWA
// ============================================

// ===== App State =====
const AppState = {
    currentUser: null,
    currentRoom: null,
    isAdmin: false,
    roomData: null,
    localGame: null,
    currentPage: 'home',
    isOffline: false,
    darkMode: true,
    soundEnabled: true,
    notifications: []
};

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
            lose: 'lose.mp3',
            correct: 'correct.mp3',
            wrong: 'wrong.mp3',
            notification: 'notification.mp3',
            levelUp: 'levelup.mp3'
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

// ===== Particles System =====
class ParticleSystem {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'particles-container';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
        `;
        document.body.prepend(this.container);
        this.particles = [];
        this.init();
    }

    init() {
        for (let i = 0; i < 50; i++) {
            this.createParticle();
        }
        setInterval(() => this.animate(), 50);
    }

    createParticle() {
        const el = document.createElement('div');
        const size = Math.random() * 4 + 2;
        const colors = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
        
        el.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            opacity: ${Math.random() * 0.5 + 0.1};
            left: ${Math.random() * 100}%;
            top: -10%;
            box-shadow: 0 0 ${size * 3}px currentColor;
        `;
        
        this.container.appendChild(el);
        this.particles.push({
            el,
            x: parseFloat(el.style.left),
            y: -10,
            speed: Math.random() * 2 + 1,
            drift: (Math.random() - 0.5) * 0.5,
            size: size,
            opacity: parseFloat(el.style.opacity)
        });
    }

    animate() {
        this.particles.forEach(p => {
            p.y += p.speed * 0.5;
            p.x += p.drift;
            
            if (p.y > 110) {
                p.y = -10;
                p.x = Math.random() * 100;
                p.speed = Math.random() * 2 + 1;
            }
            
            p.el.style.top = p.y + '%';
            p.el.style.left = p.x + '%';
            p.el.style.opacity = p.opacity * (1 - p.y / 110);
        });
    }
}

// ===== Toast System =====
function showToast(message, type = 'info', duration = 3000) {
    const container = document.querySelector('.toast-container') || (() => {
        const c = document.createElement('div');
        c.className = 'toast-container';
        document.body.appendChild(c);
        return c;
    })();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${getToastIcon(type)}"></i>
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

function getToastIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// ===== Confetti System =====
function showConfetti() {
    const colors = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#3B82F6'];
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

    for (let i = 0; i < 100; i++) {
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
        this.sound = new SoundManager();
        this.particles = new ParticleSystem();
        this.pages = {};
        this.init();
    }

    init() {
        this.createPages();
        this.setupNavigation();
        this.setupEventListeners();
        this.setupSW();
        this.renderLocalPlayersInput();
        this.loadGameData();
        this.showPage('home');
        this.setupInstallPrompt();
        
        // Show welcome toast
        setTimeout(() => {
            showToast('🎮 مرحباً بك في S&J Games', 'success');
        }, 2000);
    }

    createPages() {
        const pages = ['home', 'games', 'rooms', 'profile', 'game', 'local'];
        pages.forEach(page => {
            const el = document.createElement('div');
            el.id = `page-${page}`;
            el.className = 'page';
            this.pages[page] = el;
            document.getElementById('app-pages').appendChild(el);
        });

        this.renderHomePage();
        this.renderGamesPage();
        this.renderRoomsPage();
        this.renderProfilePage();
        this.renderGamePage();
        this.renderLocalGamePage();
    }

    // ===== Home Page =====
    renderHomePage() {
        const page = this.pages.home;
        page.innerHTML = `
            <div class="home-container">
                <div class="welcome-section">
                    <div class="welcome-text">
                        <h1>🎮 <span class="gradient-text">S&J Games</span></h1>
                        <p>منصة ألعاب تفاعلية مع الأصدقاء</p>
                    </div>
                    <div class="quick-actions">
                        <button class="btn btn-primary" onclick="window.app.showCreateRoom()">
                            <i class="fas fa-plus-circle"></i> غرفة جديدة
                        </button>
                        <button class="btn btn-success" onclick="window.app.showJoinRoom()">
                            <i class="fas fa-sign-in-alt"></i> انضمام
                        </button>
                        <button class="btn btn-purple" onclick="window.app.showLocalGame()">
                            <i class="fas fa-users"></i> لعب عن قرب
                        </button>
                    </div>
                </div>

                <div class="featured-games">
                    <h2>🌟 ألعاب مميزة</h2>
                    <div class="games-grid">
                        ${this.getGameCards()}
                    </div>
                </div>

                <div class="active-rooms-section">
                    <h2>🏠 غرف نشطة</h2>
                    <div id="active-rooms" class="rooms-grid">
                        <div class="loading-spinner"></div>
                    </div>
                </div>
            </div>
        `;
    }

    getGameCards() {
        const games = [
            { id: 'sinojem', icon: '❓', title: 'سين وجيم', desc: 'أسئلة وأجوبة', badge: 'شائعة' },
            { id: 'without-words', icon: '🤐', title: 'بدون كلام', desc: 'تخمين بالإيماءات', badge: 'جديدة' },
            { id: 'who-am-i', icon: '🕵️', title: 'من أنا', desc: 'تخمين الشخصيات', badge: 'ممتعة' }
        ];

        return games.map(game => `
            <div class="game-card" onclick="window.app.playGame('${game.id}')">
                <div class="game-card-icon">${game.icon}</div>
                <h3>${game.title}</h3>
                <p>${game.desc}</p>
                <span class="badge badge-primary">${game.badge}</span>
                <button class="btn btn-primary btn-sm">لعب الآن</button>
            </div>
        `).join('');
    }

    // ===== Games Page =====
    renderGamesPage() {
        const page = this.pages.games;
        page.innerHTML = `
            <div class="games-container">
                <h1>🎮 جميع الألعاب</h1>
                <div class="games-grid">
                    ${this.getGameCards()}
                </div>
                <div class="game-stats">
                    <div class="stat-card">
                        <i class="fas fa-trophy"></i>
                        <span>0</span>
                        <label>مباريات</label>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-star"></i>
                        <span>0</span>
                        <label>نقاط</label>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-users"></i>
                        <span>0</span>
                        <label>أصدقاء</label>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== Rooms Page =====
    renderRoomsPage() {
        const page = this.pages.rooms;
        page.innerHTML = `
            <div class="rooms-container">
                <div class="rooms-header">
                    <h1>🏠 الغرف</h1>
                    <button class="btn btn-primary" onclick="window.app.showCreateRoom()">
                        <i class="fas fa-plus"></i> إنشاء
                    </button>
                </div>
                <div id="all-rooms" class="rooms-grid">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;
    }

    // ===== Profile Page =====
    renderProfilePage() {
        const page = this.pages.profile;
        page.innerHTML = `
            <div class="profile-container">
                <div class="profile-card glass">
                    <div class="profile-avatar">
                        <img id="profile-avatar-img" src="assets/icons/default-avatar.png" alt="Avatar">
                        <div class="avatar-badge">
                            <i class="fas fa-camera"></i>
                        </div>
                    </div>
                    <h2 id="profile-name">اللاعب</h2>
                    <p id="profile-email">player@email.com</p>
                    
                    <div class="profile-stats">
                        <div class="stat-item">
                            <span class="stat-value">0</span>
                            <span class="stat-label">مباريات</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">0</span>
                            <span class="stat-label">فوز</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">0</span>
                            <span class="stat-label">نقاط</span>
                        </div>
                    </div>

                    <div class="profile-achievements">
                        <h3>🏆 الإنجازات</h3>
                        <div class="achievements-grid">
                            <div class="achievement locked">
                                <i class="fas fa-lock"></i>
                                <span>أول فوز</span>
                            </div>
                            <div class="achievement locked">
                                <i class="fas fa-lock"></i>
                                <span>10 مباريات</span>
                            </div>
                            <div class="achievement locked">
                                <i class="fas fa-lock"></i>
                                <span>100 نقطة</span>
                            </div>
                        </div>
                    </div>

                    <button class="btn btn-danger btn-block" onclick="window.app.logout()">
                        <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
                    </button>
                </div>
            </div>
        `;
    }

    // ===== Game Page =====
    renderGamePage() {
        const page = this.pages.game;
        page.innerHTML = `
            <div class="game-container">
                <div class="game-header">
                    <button class="btn btn-outline btn-sm" onclick="window.app.showPage('home')">
                        <i class="fas fa-arrow-right"></i> رجوع
                    </button>
                    <h2 id="game-title">اللعبة</h2>
                    <span id="game-status" class="badge badge-success">جاري</span>
                </div>

                <div id="game-area" class="game-area glass">
                    <div class="game-placeholder">
                        <i class="fas fa-gamepad"></i>
                        <h3>استعد للعب</h3>
                        <p>اللعبة ستبدأ قريباً</p>
                    </div>
                </div>

                <div class="game-sidebar">
                    <div class="game-players" id="game-players">
                        <h4>👥 اللاعبين</h4>
                        <div id="players-list"></div>
                    </div>
                    
                    <div class="game-chat">
                        <div class="chat-messages" id="chat-messages"></div>
                        <div class="chat-input">
                            <input type="text" id="chat-input" placeholder="اكتب رسالة...">
                            <button class="btn btn-primary btn-sm" onclick="window.app.sendMessage()">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== Local Game Page =====
    renderLocalGamePage() {
        const page = this.pages.local;
        page.innerHTML = `
            <div class="local-game-container">
                <div class="local-game-setup glass">
                    <h2>🎮 لعب عن قرب</h2>
                    <p>بدون إنترنت - على نفس الجهاز</p>
                    
                    <div class="input-group">
                        <label>عدد اللاعبين</label>
                        <select id="local-player-count" onchange="window.app.renderLocalPlayersInput()">
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

                    <button class="btn btn-success btn-block btn-lg" onclick="window.app.startLocalGame()">
                        <i class="fas fa-play"></i> بدء اللعب
                    </button>
                </div>
            </div>
        `;
        this.renderLocalPlayersInput();
    }

    // ===== Navigation =====
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.showPage(page);
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    showPage(page) {
        Object.keys(this.pages).forEach(key => {
            this.pages[key].style.display = 'none';
        });
        
        if (this.pages[page]) {
            this.pages[page].style.display = 'block';
            this.pages[page].classList.add('page-enter');
            setTimeout(() => this.pages[page].classList.remove('page-enter'), 300);
        }
        
        this.currentPage = page;
        
        // Update nav
        document.querySelectorAll('.nav-item').forEach(n => {
            n.classList.toggle('active', n.dataset.page === page);
        });
    }

    // ===== Event Listeners =====
    setupEventListeners() {
        // Global click handler for sounds
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
        });
    }

    // ===== Service Worker =====
    setupSW() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(reg => console.log('SW registered:', reg))
                    .catch(err => console.log('SW registration failed:', err));
            });
        }
    }

    // ===== Install Prompt =====
    setupInstallPrompt() {
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            const installBtn = document.getElementById('install-btn');
            if (installBtn) {
                installBtn.style.display = 'flex';
                installBtn.addEventListener('click', () => {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then(result => {
                        if (result.outcome === 'accepted') {
                            showToast('✅ تم تثبيت التطبيق!', 'success');
                        }
                        deferredPrompt = null;
                    });
                });
            }
        });
    }

    // ===== Games =====
    playGame(gameId) {
        this.showPage('game');
        document.getElementById('game-title').textContent = this.getGameTitle(gameId);
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
        switch(gameId) {
            case 'sinojem':
                this.renderSinojemGame(area);
                break;
            case 'without-words':
                this.renderWithoutWordsGame(area);
                break;
            case 'who-am-i':
                this.renderWhoAmIGame(area);
                break;
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
                <div class="question-container">
                    <div class="question-progress">
                        <div class="progress-bar" style="width: ${(current / questions.length) * 100}%"></div>
                        <span>${current + 1}/${questions.length}</span>
                    </div>
                    <div class="question-card glass">
                        <h3>${q.q}</h3>
                        <div class="options-grid">
                            ${q.options.map(opt => `
                                <button class="btn btn-outline option-btn" onclick="window.app.checkAnswer(this, '${opt}', '${q.a}')">
                                    ${opt}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="question-score">
                        <span>⭐ النقاط: ${score}</span>
                    </div>
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
                <div class="word-game-container">
                    <div class="word-card glass">
                        <div class="word-icon">🎭</div>
                        <h3 class="word-display">${word}</h3>
                        <p>🗣️ قم بوصف الكلمة بدون كلام</p>
                        <div class="word-actions">
                            <button class="btn btn-success" onclick="window.app.wordCorrect()">
                                <i class="fas fa-check"></i> صحيحة
                            </button>
                            <button class="btn btn-danger" onclick="window.app.wordWrong()">
                                <i class="fas fa-times"></i> خاطئة
                            </button>
                            <button class="btn btn-warning" onclick="window.app.wordSkip()">
                                <i class="fas fa-forward"></i> تخطي
                            </button>
                        </div>
                        <div class="word-score">⭐ النقاط: ${score}</div>
                    </div>
                </div>
            `;
        };

        window.wordCorrect = () => {
            score += 5;
            this.sound.play('correct');
            showToast('✅ إجابة صحيحة! +5 نقاط', 'success');
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
                <div class="whoami-container">
                    <div class="whoami-card glass">
                        <div class="whoami-icon">🕵️</div>
                        <h3>من أنا؟</h3>
                        <p class="whoami-hint">${char.hint}</p>
                        <div class="whoami-input">
                            <input type="text" id="whoami-guess" placeholder="اكتب التخمين..." />
                            <button class="btn btn-primary" onclick="window.app.checkWhoAmI('${char.name}')">
                                <i class="fas fa-search"></i> تخمين
                            </button>
                        </div>
                        <div class="word-score">⭐ النقاط: ${score}</div>
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
            <div class="game-result glass">
                <div class="result-icon">${percent >= 80 ? '🏆' : '🎯'}</div>
                <h2>${grade}</h2>
                <p>النقاط: ${score} من ${total * 10}</p>
                <div class="result-progress">
                    <div class="progress-bar" style="width: ${percent}%"></div>
                </div>
                <button class="btn btn-primary" onclick="window.app.showPage('home')">
                    <i class="fas fa-home"></i> العودة للرئيسية
                </button>
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
        const player = this.localGame.players[this.localGame.currentPlayer];
        
        area.innerHTML = `
            <div class="local-game-play">
                <div class="game-players-display">
                    ${this.localGame.players.map((p, i) => `
                        <div class="player-card ${i === this.localGame.currentPlayer ? 'active' : ''}">
                            <div class="player-avatar">${p.name[0]}</div>
                            <span>${p.name}</span>
                            <span class="player-score">${p.score}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="game-content">
                    <h3>دور: ${player.name}</h3>
                    ${this.getLocalGameContent()}
                </div>
            </div>
        `;
    }

    getLocalGameContent() {
        const game = this.localGame?.game || 'sinojem';
        switch(game) {
            case 'sinojem':
                return this.getLocalSinojem();
            case 'without-words':
                return this.getLocalWithoutWords();
            case 'who-am-i':
                return this.getLocalWhoAmI();
            default:
                return '<p>اختر لعبة</p>';
        }
    }

    getLocalSinojem() {
        const questions = [
            { q: 'ما هو عاصمة مصر؟', options: ['القاهرة', 'الإسكندرية', 'الجيزة', 'أسوان'], a: 'القاهرة' },
            { q: 'كم عدد الكواكب في المجموعة الشمسية؟', options: ['7', '8', '9', '10'], a: '8' }
        ];
        const q = questions[this.localGame.currentPlayer % questions.length];
        return `
            <div class="question-card">
                <h4>${q.q}</h4>
                <div class="options-grid">
                    ${q.options.map(opt => `
                        <button class="btn btn-outline option-btn" onclick="window.app.localAnswer('${opt}', '${q.a}')">${opt}</button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getLocalWithoutWords() {
        const words = ['تفاحة', 'سيارة', 'بيت', 'شمس', 'قمر'];
        const word = words[this.localGame.currentPlayer % words.length];
        return `
            <div class="word-game">
                <div class="word-display">${word}</div>
                <p>🗣️ صف الكلمة بدون كلام</p>
                <div class="word-actions">
                    <button class="btn btn-success" onclick="window.app.localCorrect()">✅ صحيحة</button>
                    <button class="btn btn-danger" onclick="window.app.localWrong()">❌ خاطئة</button>
                    <button class="btn btn-warning" onclick="window.app.localSkip()">⏭️ تخطي</button>
                </div>
            </div>
        `;
    }

    getLocalWhoAmI() {
        const characters = [
            { name: 'أحمد زكي', hint: 'ممثل مصري' },
            { name: 'جيف بيزوس', hint: 'رجل أعمال' }
        ];
        const char = characters[this.localGame.currentPlayer % characters.length];
        return `
            <div class="whoami-game">
                <p>${char.hint}</p>
                <div class="whoami-input">
                    <input type="text" id="local-whoami-guess" placeholder="من أنا؟">
                    <button class="btn btn-primary" onclick="window.app.localWhoAmI('${char.name}')">تخمين</button>
                </div>
            </div>
        `;
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

    // ===== Show Dialogs =====
    showCreateRoom() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal glass">
                <button class="modal-close" onclick="this.closest('.modal
