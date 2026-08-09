import { db } from "./config";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

export const fsGetAll = async (col) => {
  const snap = await getDocs(collection(db, col));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const fsGetWhere = async (col, field, value) => {
  const snap = await getDocs(query(collection(db, col), where(field, "==", value)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const fsAdd = async (col, data) => {
  // If data has an id, use setDoc so Firestore doc id matches our id
  if (data.id) {
    await setDoc(doc(db, col, String(data.id)), data);
    return data;
  }
  const ref = await addDoc(collection(db, col), data);
  return { id: ref.id, ...data };
};

export const fsUpdate = async (col, id, data) => {
  await updateDoc(doc(db, col, String(id)), data);
};

export const fsDelete = async (col, id) => {
  await deleteDoc(doc(db, col, String(id)));
};
