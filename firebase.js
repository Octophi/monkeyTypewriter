import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { connectFirestoreEmulator, getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { FIREBASE_WEB_CONFIG } from "./js/firebase-config.js";

const PROD_FIREBASE_CONFIG = FIREBASE_WEB_CONFIG;

const EMULATOR_FIREBASE_CONFIG = {
  projectId: "monkey-typewriter",
};

const searchParams = new URLSearchParams(window.location.search);
const envParam = searchParams.get("env");
const forceLocal = envParam === "local";
const forceProd = envParam === "prod";
const isLocalHost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.endsWith(".local");

const useEmulator = forceLocal || (!forceProd && isLocalHost);
const firebaseConfig = useEmulator ? EMULATOR_FIREBASE_CONFIG : PROD_FIREBASE_CONFIG;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore instance
const db = getFirestore(app);

if (useEmulator) {
  const emulatorHost = searchParams.get("emulatorHost") || "127.0.0.1";
  const emulatorPort = Number(searchParams.get("emulatorPort") || "8080");
  connectFirestoreEmulator(db, emulatorHost, emulatorPort);
  console.log(`[firebase] using Firestore emulator at ${emulatorHost}:${emulatorPort}`);
} else {
  if (
    !PROD_FIREBASE_CONFIG.apiKey ||
    !PROD_FIREBASE_CONFIG.authDomain ||
    !PROD_FIREBASE_CONFIG.appId
  ) {
    console.warn(
      "[firebase] Production Firebase config is incomplete. Generate js/firebase-config.js from env vars before deploying."
    );
  }
  console.log("[firebase] using production Firestore");
}

export { db };
