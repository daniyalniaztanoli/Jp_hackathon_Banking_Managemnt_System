import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fsGetAll, fsGetWhere, fsAdd, fsUpdate } from "../../firebase/firestoreService";

export const LOAN_APPROVAL_LIMIT = 1000000;

const COL = "loans";

export const fetchLoans = createAsyncThunk("loans/fetchAll", async (customerId) => {
  if (customerId) return await fsGetWhere(COL, "customerId", customerId);
  return await fsGetAll(COL);
});

export const requestLoan = createAsyncThunk("loans/request", async (loanData) => {
  const payload = { ...loanData, status: "pending", approvedBy: null };
  return await fsAdd(COL, payload);
});

export const decideLoan = createAsyncThunk("loans/decide", async ({ id, status, approvedBy, approvedById }) => {
  await fsUpdate(COL, id, { status, approvedBy, approvedById });
  return { id, status, approvedBy, approvedById };
});

const loansSlice = createSlice({
  name: "loans",
  initialState: { list: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoans.pending, (state) => { state.status = "loading"; })
      .addCase(fetchLoans.fulfilled, (state, action) => { state.status = "succeeded"; state.list = action.payload; })
      .addCase(requestLoan.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(decideLoan.fulfilled, (state, action) => {
        const idx = state.list.findIndex((l) => l.id === action.payload.id);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload };
      });
  },
});

export default loansSlice.reducer;
