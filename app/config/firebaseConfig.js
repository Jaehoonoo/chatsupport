import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfigAuth = {
  apiKey: "AIzaSyAB-BhpIySUdAaMk0kyVKINJTR7HFgqZj4",
  authDomain: "chatsupport-d46fd.firebaseapp.com",
  projectId: "chatsupport-d46fd",
};

// Initialize Firebase app for user authentication with a unique name
const appAuth = !getApps().some(app => app.name === 'authApp') 
  ? initializeApp(firebaseConfigAuth, 'authApp') 
  : getApp('authApp');

const auth = getAuth(appAuth);

export { auth };
