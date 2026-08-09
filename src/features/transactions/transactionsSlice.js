import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fsGetAll, fsGetWhere, fsAdd, fsUpdate } from "../../firebase/firestoreService";

const COL = "transactions";

export const fetchTransactions = createAsyncThunk("transactions/fetchAll", async (customerId) => {
  if (customerId) return await fsGetWhere(COL, "customerId", customerId);
  return await fsGetAll(COL);
});

export const createTransactionRequest = createAsyncThunk("transactions/create", async (transactionData) => {
  const payload = { ...transactionData, status: "pending", date: new Date().toISOString().split("T")[0] };
  return await fsAdd(COL, payload);
});

export const updateTransactionStatus = createAsyncThunk("transactions/updateStatus", async ({ id, status }) => {
  await fsUpdate(COL, id, { status });
  return { id, status };
});

const transactionsSlice = createSlice({
  name: "transactions",
  initialState: { list: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => { state.status = "loading"; })
      .addCase(fetchTransactions.fulfilled, (state, action) => { state.status = "succeeded"; state.list = action.payload; })
      .addCase(createTransactionRequest.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(updateTransactionStatus.fulfilled, (state, action) => {
        const idx = state.list.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], status: action.payload.status };
      });
  },
});

export default transactionsSlice.reducer;
