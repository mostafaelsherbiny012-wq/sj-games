// ============================================
// Firebase Configuration - S&J Games
// ============================================

// بيانات مشروع Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD51re4yqFRQVJlsegem74PlA4zMiiDaow",
  authDomain: "sj-games-86487.firebaseapp.com",
  projectId: "sj-games-86487",
  storageBucket: "sj-games-86487.firebasestorage.app",
  messagingSenderId: "725268812733",
  appId: "1:725268812733:web:530512bc27bcf31736f8d4",
  measurementId: "G-JVGHG6N63L"
};

// تشغيل Firebase مرة واحدة فقط
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// الخدمات
const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();

// تشغيل العمل بدون نت
firestore.enablePersistence({ synchronizeTabs: true })
.then(() => {
    console.log("✅ Firestore Offline Enabled");
})
.catch((err) => {
    console.log("⚠️ Offline Error:", err.code);
});

// ============================================
// Authentication
// ============================================

const AuthHelper = {

    getCurrentUser() {
        return auth.currentUser;
    },

    isAuthenticated() {
        return !!auth.currentUser;
    },

    async signInGoogle() {

        try {

            const provider = new firebase.auth.GoogleAuthProvider();

            const result = await auth.signInWithPopup(provider);

            const user = result.user;

            await firestore.collection("users").doc(user.uid).set({

                uid: user.uid,
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL || "",
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()

            }, { merge: true });

            return user;

        } catch (e) {

            console.error(e);
            throw e;

        }

    },

    async signOut() {
        await auth.signOut();
    }

};

// ============================================
// Firestore
// ============================================

const FirestoreHelper = {

    async createUserProfile(uid, data) {

        return firestore.collection("users").doc(uid).set(data, {
            merge: true
        });

    },

    async getUserProfile(uid) {

        const doc = await firestore.collection("users").doc(uid).get();

        if (doc.exists) {
            return doc.data();
        }

        return null;

    },

    async updateUserProfile(uid, data) {

        return firestore.collection("users").doc(uid).update(data);

    },

    async createRoom(roomId, data) {

        return firestore.collection("rooms").doc(roomId).set(data);

    },

    async getRoom(roomId) {

        const doc = await firestore.collection("rooms").doc(roomId).get();

        if (doc.exists) {
            return doc.data();
        }

        return null;

    },

    async updateRoom(roomId, data) {

        return firestore.collection("rooms").doc(roomId).update(data);

    },

    async deleteRoom(roomId) {

        return firestore.collection("rooms").doc(roomId).delete();

    }

};

// ============================================
// Storage
// ============================================

const StorageHelper = {

    async uploadImage(path, file) {

        const ref = storage.ref(path);

        await ref.put(file);

        return await ref.getDownloadURL();

    }

};

// ============================================
// Export
// ============================================

window.firebaseApp = firebase;
window.firebaseAuth = auth;
window.firebaseFirestore = firestore;
window.firebaseStorage = storage;

window.AuthHelper = AuthHelper;
window.FirestoreHelper = FirestoreHelper;
window.StorageHelper = StorageHelper;

console.log("🔥 Firebase Ready");
