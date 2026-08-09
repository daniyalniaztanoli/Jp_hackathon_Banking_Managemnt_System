import { firebaseConfig } from "./config";

const SIGNUP_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`;

/**
 * Creates a Firebase Auth account for a new user.
 * Does NOT affect the currently logged-in session.
 */
export const createFirebaseUser = async (email, password) => {
  const res = await fetch(SIGNUP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: false }),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message || "Failed to create auth account";
    throw new Error(msg);
  }

  return data;
};
