import { collection,getDocs,limit,orderBy,query } from 'firebase/firestore';
import { adminDb } from '../firebase/adminFirebase.js';
export async function listTransactions(id){const snap=await getDocs(query(collection(adminDb,'students',id,'transactions'),orderBy('createdAt','desc'),limit(100)));return snap.docs.map(x=>({id:x.id,...x.data()}));}
