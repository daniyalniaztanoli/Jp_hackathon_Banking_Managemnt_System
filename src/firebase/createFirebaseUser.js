const SIGNUP_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${import.meta.env.VITE_FIREBASE_API_KEY}`;

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
