import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

// Google Sign-In
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

// Email/Password Register
export const registerWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

// Email/Password Login
export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

// Logout
export const logout = () => signOut(auth);

// Auth state listener
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);