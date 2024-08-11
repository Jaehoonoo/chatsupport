import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfigAuth = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const appAuth = !getApps().some(app => app.name === 'authApp') 
  ? initializeApp(firebaseConfigAuth, 'authApp') 
  : getApp('authApp');

const auth = getAuth(appAuth);

export { auth };
