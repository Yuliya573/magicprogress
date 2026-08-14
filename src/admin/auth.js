import { collection, getDocs, limit, query } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { adminAuth, adminDb } from '../firebase/adminFirebase.js';
import { loginToEmail } from '../shared/formatters.js';

export function watchAdmin(callback, onError) {
  return onAuthStateChanged(adminAuth, async (user) => {
    try {
      if (!user) return callback(null);
      // Firestore Rules verify admins/{uid} internally. The client must not
      // read the private admins collection directly.
      await getDocs(query(collection(adminDb, 'students'), limit(1)));
      callback(user);
    } catch (error) {
      console.error(error);
      await signOut(adminAuth);
      onError(new Error('Нет доступа. Проверьте UID администратора и поле active.'));
    }
  });
}

export const login = (value, password) => signInWithEmailAndPassword(adminAuth, loginToEmail(value), password);
export const logout = () => signOut(adminAuth);
