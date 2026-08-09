import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createFirebaseUser } from "../../firebase/createFirebaseUser";
import { fsGetAll, fsAdd, fsUpdate, fsDelete } from "../../firebase/firestoreService";

const COL = "customers";

export const fetchCustomers = createAsyncThunk("customers/fetchAll", async () => {
  return await fsGetAll(COL);
});

export const createCustomer = createAsyncThunk(
  "customers/create",
  async ({ password, ...data }, { rejectWithValue }) => {
    try {
      await createFirebaseUser(data.email, password);
      const record = await fsAdd(COL, data);
      return record;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCustomer = createAsyncThunk("customers/update", async ({ id, ...data }) => {
  await fsUpdate(COL, id, { id, ...data });
  return { id, ...data };
});

export const deleteCustomer = createAsyncThunk("customers/delete", async (id) => {
  await fsDelete(COL, id);
  return id;
});

export const updateCustomerBalance = createAsyncThunk("customers/updateBalance", async ({ id, balance }) => {
  await fsUpdate(COL, id, { balance });
  return { id, balance };
});

const customersSlice = createSlice({
  name: "customers",
  initialState: { list: [], status: "idle", error: null, createError: null },
  reducers: { clearCreateError: (state) => { state.createError = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => { state.status = "loading"; })
      .addCase(fetchCustomers.fulfilled, (state, action) => { state.status = "succeeded"; state.list = action.payload; })
      .addCase(fetchCustomers.rejected, (state, action) => { state.status = "failed"; state.error = action.error.message; })
      .addCase(createCustomer.fulfilled, (state, action) => { state.list.push(action.payload); state.createError = null; })
      .addCase(createCustomer.rejected, (state, action) => { state.createError = action.payload; })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload };
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      })
      .addCase(updateCustomerBalance.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], balance: action.payload.balance };
      });
  },
});

export const { clearCreateError } = customersSlice.actions;
export default customersSlice.reducer;
