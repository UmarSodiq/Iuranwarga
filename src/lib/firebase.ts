import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  projectId: config.projectId,
  appId: config.appId,
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  measurementId: config.measurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with explicit database ID from config
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, config.firestoreDatabaseId || '(default)');
