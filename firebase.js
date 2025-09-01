import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Minimal Firebase config (only projectId needed for emulator)
const firebaseConfig = {
  projectId: "monkey-typewriter",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore instance
const db = getFirestore(app);

// Connect Firestore to emulator (adjust IP if running on another device)
connectFirestoreEmulator(db, "localhost", 8080);
// Or: connectFirestoreEmulator(db, "192.168.x.xxx", 8080);

export { db };