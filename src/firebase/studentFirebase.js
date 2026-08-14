import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
export const studentFirebaseConfig = { apiKey: 'AIzaSyDuI54JEPZrV_H4KCPJIjQkl5mHzKPpngM', authDomain: 'magic-progress.firebaseapp.com', projectId: 'magic-progress', storageBucket: 'magic-progress.firebasestorage.app', messagingSenderId: '494130229204', appId: '1:494130229204:web:fec4549084a847f39bf041' };
export const studentApp = initializeApp(studentFirebaseConfig, 'student');
export const studentDb = getFirestore(studentApp);
export const isStudentConfigured = !studentFirebaseConfig.apiKey.startsWith('YOUR_');
