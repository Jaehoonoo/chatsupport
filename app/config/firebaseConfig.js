import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAB-BhpIySUdAaMk0kyVKINJTR7HFgqZj4",
  authDomain: "chatsupport-d46fd.firebaseapp.com",
  projectId: "chatsupport-d46fd",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
