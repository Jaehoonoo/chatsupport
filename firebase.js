import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for chat history
const firebaseConfigChat = {
  apiKey: "AIzaSyD95zuXHMPE224wOBKxa2gWTBjp_Rq90b0",
  authDomain: "chatsupport-c7567.firebaseapp.com",
  projectId: "chatsupport-c7567",
  storageBucket: "chatsupport-c7567.appspot.com",
  messagingSenderId: "696336187214",
  appId: "1:696336187214:web:4267d19e012cefb83c281f"
};

// Initialize Firebase app for chat history with a unique name
const appChat = !getApps().some(app => app.name === 'chatApp') 
  ? initializeApp(firebaseConfigChat, 'chatApp') 
  : getApp('chatApp');

const db = getFirestore(appChat);

export { db };
