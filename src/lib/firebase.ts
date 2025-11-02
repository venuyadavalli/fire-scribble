import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDl_J89I5PFyug5SPi2Vi6nTt1JEhhiG8g",
  authDomain: "microblog-28b2b.firebaseapp.com",
  projectId: "microblog-28b2b",
  storageBucket: "microblog-28b2b.firebasestorage.app",
  messagingSenderId: "300984742339",
  appId: "1:300984742339:web:049cb79be9e99863124d76",
  measurementId: "G-VMXK9P9GQW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
