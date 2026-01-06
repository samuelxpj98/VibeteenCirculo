
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  getDocs, 
  where,
  setDoc,
  getDoc,
  updateDoc,
  limit
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { CauseAction, ActionType, User, UserStatus } from '../types.ts';

const firebaseConfig = {
  apiKey: "AIzaSyAXP8095JDr1Ck1xFOoF5lCREE9VxXMUJw",
  authDomain: "vibe-teen.firebaseapp.com",
  projectId: "vibe-teen",
  storageBucket: "vibe-teen.firebasestorage.app",
  messagingSenderId: "137191414500",
  appId: "1:137191414500:web:8ad24baadb6aafe6ff2af1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const actionsRef = collection(db, 'vibe_teen_actions');
const usersRef = collection(db, 'vibe_teen_users');

export const subscribeToActions = (callback: (actions: CauseAction[]) => void) => {
  const q = query(actionsRef, orderBy('timestamp', 'desc'), limit(200));
  return onSnapshot(q, (snapshot) => {
    const actions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CauseAction[];
    callback(actions);
  });
};

export const registerAction = async (data: { userName: string, friendName: string, action: ActionType, userColor: string }): Promise<void> => {
  try {
    await addDoc(actionsRef, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao salvar ação:", error);
    throw error;
  }
};

export const saveOrUpdateUser = async (user: User): Promise<void> => {
  const userDoc = doc(usersRef, user.email.toLowerCase());
  await setDoc(userDoc, {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email.toLowerCase(),
    avatarColor: user.avatarColor,
    status: user.status || 'Visitante'
  }, { merge: true });
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const userDoc = doc(usersRef, email.toLowerCase());
  const snap = await getDoc(userDoc);
  if (snap.exists()) {
    return snap.data() as User;
  }
  return null;
};

export const getAllUsers = async (): Promise<User[]> => {
  const snap = await getDocs(usersRef);
  return snap.docs.map(doc => doc.data() as User);
};

export const updateUserDetails = async (email: string, details: Partial<User>): Promise<void> => {
  const userDoc = doc(usersRef, email.toLowerCase());
  await updateDoc(userDoc, details);
};

export const updateUserStatus = async (email: string, status: UserStatus): Promise<void> => {
  const userDoc = doc(usersRef, email.toLowerCase());
  await updateDoc(userDoc, { status });
};

export const deleteUser = async (email: string): Promise<void> => {
  const userDoc = doc(usersRef, email.toLowerCase());
  await deleteDoc(userDoc);
};

export const deleteAction = async (actionId: string): Promise<void> => {
  const actionDoc = doc(db, 'vibe_teen_actions', actionId);
  await deleteDoc(actionDoc);
};
