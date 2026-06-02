import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAPwRUWzsCmwZcihIO59zoog5ZkdVRvLBw',
  authDomain: 'caverna-digital-plataform.firebaseapp.com',
  projectId: 'caverna-digital-plataform',
  storageBucket: 'caverna-digital-plataform.firebasestorage.app',
  messagingSenderId: '241779541191',
  appId: '1:241779541191:web:c19899a94bade9fd3aaae2',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
