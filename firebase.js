import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// To use firestore (online)
// 1. Uncomment the firebaseConfig with all the details (or add your own config if you have a different project)
// 2. Comment out the minimal firebaseConfig (the one with only projectId)
// 3. Uncomment the connectFirestoreEmulator line and update the IP address if needed (if running on another device)


// To use firestore emulator (offline)
// 1. Make sure you have the Firebase CLI installed and the emulator running (firebase emulators:start)
// 2. Uncomment the minimal firebaseConfig (the one with only projectId)
// 3. Comment out the firebaseConfig with all the details
// 4. Uncomment the connectFirestoreEmulator line and update the IP address to be your machine's local IP address
// 5. Your browser should be localhost:xxxx. Everyone else should join your_ip:xxxx

// Minimal Firebase config (only projectId needed for emulator)

const firebaseConfig = {
  projectId: "monkey-typewriter",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore instance
const db = getFirestore(app);

// Connect Firestore to emulator (adjust IP if running on another device)
connectFirestoreEmulator(db, "192.168.68.159", 8080); // UPDATE IP (Second Arg)

export { db };