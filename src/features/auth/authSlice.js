import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { fsGetWhere } from "../../firebase/firestoreService";

const findUserRole = async (email) => {
  const [customers, employees, managers] = await Promise.all([
    fsGetWhere("customers", "email", email),
    fsGetWhere("employees", "email", email),
    fsGetWhere("managers", "email", email),
  ]);

  if (customers.length) return { role: "customer", profile: customers[0] };
  if (employees.length) return { role: "employee", profile: employees[0] };
  if (managers.length) return { role: "manager", profile: managers[0] };

  throw new Error("No matching role found for this account");
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const { role, profile } = await findUserRole(cred.user.email);
      return { uid: cred.user.uid, email: cred.user.email, role, profile };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await signOut(auth);
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, status: "idle", error: null },
  reducers: {
    clearAuthError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => { state.status = "succeeded"; state.user = action.payload; })
      .addCase(loginUser.rejected, (state, action) => { state.status = "failed"; state.error = action.payload || "Login failed"; })
      .addCase(logoutUser.fulfilled, (state) => { state.user = null; state.status = "idle"; });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
