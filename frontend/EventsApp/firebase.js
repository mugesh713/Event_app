import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBUpaCPk-KYsHi-cBKok46wLc9HD6LpUnw",
  authDomain: "eventsapp-8ff29.firebaseapp.com",
  projectId: "eventsapp-8cf29",
  storageBucket: "eventsapp-8ff29.appspot.com",
  messagingSenderId: "13510641000",
  appId: "1:13510641090:web:d5e6312a66f4a89421825b",
  measurementId: "G-Z2F8EXYBBB"
};

const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

export { storage };
