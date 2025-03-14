// uploadData.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import fs from 'fs';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadData() {
  try {
    const rawData = fs.readFileSync('./src/data.json');
    const data = JSON.parse(rawData.toString());
    const menusCollection = collection(db, "menus"); // Koleksiyon adı
    for (const menu of data.menus) {
      await addDoc(menusCollection, menu);
      console.log("Uploaded:", menu.date);
    }
    console.log("Data upload complete!");
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

uploadData();