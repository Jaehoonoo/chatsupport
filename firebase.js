import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for chat history
const firebaseConfigChat = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_CHAT_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_CHAT_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_CHAT_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_CHAT_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_CHAT_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_CHAT_APP_ID,
};

// Initialize Firebase app for chat history with a unique name
const appChat = !getApps().some(app => app.name === 'chatApp') 
  ? initializeApp(firebaseConfigChat, 'chatApp') 
  : getApp('chatApp');

const db = getFirestore(appChat);

export { db };
