import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  getDocs,
  collection,
  serverTimestamp,
  orderBy,
  query,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── USER PROFILE ─────────────────────────────────────────

export const saveUserProfile = async (uid, data) => {
  await setDoc(doc(db, "users", uid), data, { merge: true });
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
};

// ─── EMOTION LOGS ─────────────────────────────────────────

export const saveLog = async (uid, logData) => {
  await addDoc(collection(db, "users", uid, "logs"), {
    ...logData,
    timestamp: serverTimestamp(),
  });
};

export const getLogs = async (uid) => {
  const q = query(
    collection(db, "users", uid, "logs"),
    orderBy("timestamp", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ─── COMMUNITY POSTS ──────────────────────────────────────

export const savePost = async (postData) => {
  await addDoc(collection(db, "community"), {
    ...postData,
    timestamp: serverTimestamp(),
  });
};

export const getPosts = async () => {
  const q = query(
    collection(db, "community"),
    orderBy("timestamp", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};