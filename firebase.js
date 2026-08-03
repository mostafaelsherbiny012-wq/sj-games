// ============================================
// Firebase Configuration - S&J Games
// ============================================

// 🔥 استبدل هذه البيانات ببيانات مشروعك من Firebase Console
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com"
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
    }
};

// Export for use in app.js
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
