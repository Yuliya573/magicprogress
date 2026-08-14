import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
export const adminFirebaseConfig = { apiKey: 'AIzaSyDuI54JEPZrV_H4KCPJIjQkl5mHzKPpngM', authDomain: 'magic-progress.firebaseapp.com', projectId: 'magic-progress', storageBucket: 'magic-progress.firebasestorage.app', messagingSenderId: '494130229204', appId: '1:494130229204:web:fec4549084a847f39bf041' };
export const adminApp = initializeApp(adminFirebaseConfig, 'admin');
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const isAdminConfigured = !adminFirebaseConfig.apiKey.startsWith('YOUR_');
