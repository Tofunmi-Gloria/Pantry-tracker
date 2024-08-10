// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_c8RiO_yk4zh8BNIVQXiDn2hmcCciKB0",
  authDomain: "inventory-management-app-e7c90.firebaseapp.com",
  projectId: "inventory-management-app-e7c90",
  storageBucket: "inventory-management-app-e7c90.appspot.com",
  messagingSenderId: "667739910129",
  appId: "1:667739910129:web:3b481c71357a68e2135e50",
  measurementId: "G-HRVG0LDMQ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);