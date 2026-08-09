import { db } from "./config";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
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

// Real-time listener — calls callback whenever data changes
export const fsSubscribe = (col, callback, filterField, filterValue) => {
  const q = filterField
    ? query(collection(db, col), where(filterField, "==", filterValue))
    : collection(db, col);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};
