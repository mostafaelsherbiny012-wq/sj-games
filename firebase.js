// ============================================
// Firebase Configuration - S&J Games
// ============================================

// 🔥 استبدل هذه البيانات ببيانات مشروعك من Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyB7x8Y9zA1bC2dE3fG4hI5jK6lM7nO8pQ9rS0tU",
    authDomain: "sj-games-12345.firebaseapp.com",
    projectId: "sj-games-12345",
    storageBucket: "sj-games-12345.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890",
    databaseURL: "https://sj-games-12345-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();
const database = firebase.database();

// Enable offline persistence
firestore.enablePersistence({ synchronizeTabs: true })
    .then(() => console.log('✅ Firestore persistence enabled'))
    .catch(err => console.warn('⚠️ Firestore persistence error:', err));

console.log('🔥 Firebase initialized successfully!');
console.log('📁 Auth:', auth);
console.log('📁 Firestore:', firestore);
console.log('📁 Storage:', storage);
console.log('📁 Realtime Database:', database);

// ============================================
// Firebase Helper Functions
// ============================================

// Auth Helpers
const AuthHelper = {
    getCurrentUser: () => auth.currentUser,
    isAuthenticated: () => !!auth.currentUser,
    getUserId: () => auth.currentUser?.uid || null,
    getUserName: () => auth.currentUser?.displayName || 'مستخدم',
    getUserPhoto: () => auth.currentUser?.photoURL || null,
    getUserEmail: () => auth.currentUser?.email || null
};

// Firestore Helpers
const FirestoreHelper = {
    async getUserProfile(userId) {
        try {
            const doc = await firestore.collection('users').doc(userId).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    },
    
    async updateUserProfile(userId, data) {
        try {
            await firestore.collection('users').doc(userId).update(data);
            return true;
        } catch (error) {
            console.error('Error updating user profile:', error);
            return false;
        }
    },
    
    async createUserProfile(userId, data) {
        try {
            await firestore.collection('users').doc(userId).set(data);
            return true;
        } catch (error) {
            console.error('Error creating user profile:', error);
            return false;
        }
    },
    
    async getRoom(roomId) {
        try {
            const doc = await firestore.collection('rooms').doc(roomId).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            console.error('Error getting room:', error);
            return null;
        }
    },
    
    async createRoom(roomId, data) {
        try {
            await firestore.collection('rooms').doc(roomId).set(data);
            return true;
        } catch (error) {
            console.error('Error creating room:', error);
            return false;
        }
    },
    
    async updateRoom(roomId, data) {
        try {
            await firestore.collection('rooms').doc(roomId).update(data);
            return true;
        } catch (error) {
            console.error('Error updating room:', error);
            return false;
        }
    },
    
    async deleteRoom(roomId) {
        try {
            await firestore.collection('rooms').doc(roomId).delete();
            return true;
        } catch (error) {
            console.error('Error deleting room:', error);
            return false;
        }
    },
    
    async getActiveRooms(limit = 20) {
        try {
            const snapshot = await firestore.collection('rooms')
                .where('isPlaying', '==', false)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting active rooms:', error);
            return [];
        }
    },
    
    async addPlayerToRoom(roomId, player) {
        try {
            const room = await this.getRoom(roomId);
            if (!room) return false;
            const players = [...(room.players || []), player];
            await this.updateRoom(roomId, { players });
            return true;
        } catch (error) {
            console.error('Error adding player to room:', error);
            return false;
        }
    },
    
    async removePlayerFromRoom(roomId, playerId) {
        try {
            const room = await this.getRoom(roomId);
            if (!room) return false;
            const players = (room.players || []).filter(p => p.uid !== playerId);
            await this.updateRoom(roomId, { players });
            return true;
        } catch (error) {
            console.error('Error removing player from room:', error);
            return false;
        }
    }
};

// Realtime Database Helpers
const RealtimeHelper = {
    async sendMessage(roomId, message) {
        try {
            const ref = database.ref(`rooms/${roomId}/chat`);
            await ref.push(message);
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    },
    
    listenMessages(roomId, callback) {
        const ref = database.ref(`rooms/${roomId}/chat`);
        ref.on('child_added', (snapshot) => {
            callback({ id: snapshot.key, ...snapshot.val() });
        });
        return () => ref.off();
    },
    
    setTyping(roomId, userId, name) {
        const ref = database.ref(`rooms/${roomId}/typing/${userId}`);
        ref.set({ name, timestamp: Date.now() });
    },
    
    removeTyping(roomId, userId) {
        const ref = database.ref(`rooms/${roomId}/typing/${userId}`);
        ref.remove();
    },
    
    listenTyping(roomId, callback) {
        const ref = database.ref(`rooms/${roomId}/typing`);
        ref.on('value', (snapshot) => {
            callback(snapshot.val() || {});
        });
        return () => ref.off();
    },
    
    async submitAnswer(roomId, answer) {
        try {
            const ref = database.ref(`rooms/${roomId}/answers`);
            await ref.push(answer);
            return true;
        } catch (error) {
            console.error('Error submitting answer:', error);
            return false;
        }
    },
    
    listenAnswers(roomId, callback) {
        const ref = database.ref(`rooms/${roomId}/answers`);
        ref.on('child_added', (snapshot) => {
            callback({ id: snapshot.key, ...snapshot.val() });
        });
        return () => ref.off();
    }
};

// Storage Helpers
const StorageHelper = {
    async uploadImage(path, file) {
        try {
            const ref = storage.ref(path);
            await ref.put(file);
            return await ref.getDownloadURL();
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    },
    
    async uploadAvatar(userId, file) {
        const path = `avatars/${userId}/${Date.now()}_${file.name}`;
        return this.uploadImage(path, file);
    },
    
    async uploadRoomImage(roomId, file) {
        const path = `room_images/${roomId}/${Date.now()}_${file.name}`;
        return this.uploadImage(path, file);
    },
    
    async deleteFile(path) {
        try {
            await storage.ref(path).delete();
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    },
    
    async getFileUrl(path) {
        try {
            return await storage.ref(path).getDownloadURL();
        } catch (error) {
            console.error('Error getting file URL:', error);
            return null;
        }
    }
};

// ============================================
// Export for use in app.js
// ============================================
window.firebaseApp = firebase;
window.firebaseAuth = auth;
window.firebaseFirestore = firestore;
window.firebaseStorage = storage;
window.firebaseDatabase = database;
window.AuthHelper = AuthHelper;
window.FirestoreHelper = FirestoreHelper;
window.RealtimeHelper = RealtimeHelper;
window.StorageHelper = StorageHelper;

console.log('✅ Firebase helpers loaded successfully!');
