import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


export const firebaseConfig = {
  apiKey: "AIzaSyDXeO4MR7HbJOut_NQEp5D2I7VK0qx8EWQ",
  authDomain: "banking-b2b6d.firebaseapp.com",
  projectId: "banking-b2b6d",
  storageBucket: "banking-b2b6d.firebasestorage.app",
  messagingSenderId: "213588892283",
  appId: "1:213588892283:web:3c8b2821eccc464ce5a0de",
  measurementId: "G-4MQ2JGQPQ4",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
