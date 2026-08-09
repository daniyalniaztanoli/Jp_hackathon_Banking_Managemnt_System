import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createFirebaseUser } from "../../firebase/createFirebaseUser";
import { fsGetAll, fsAdd, fsUpdate, fsDelete } from "../../firebase/firestoreService";

const COL = "employees";

export const fetchEmployees = createAsyncThunk("employees/fetchAll", async () => {
  return await fsGetAll(COL);
});

export const createEmployee = createAsyncThunk(
  "employees/create",
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

export const updateEmployee = createAsyncThunk("employees/update", async ({ id, ...data }) => {
  await fsUpdate(COL, id, { id, ...data });
  return { id, ...data };
});

export const deleteEmployee = createAsyncThunk("employees/delete", async (id) => {
  await fsDelete(COL, id);
  return id;
});

const employeesSlice = createSlice({
  name: "employees",
  initialState: { list: [], status: "idle", error: null, createError: null },
  reducers: { clearCreateError: (state) => { state.createError = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => { state.status = "loading"; })
      .addCase(fetchEmployees.fulfilled, (state, action) => { state.status = "succeeded"; state.list = action.payload; })
      .addCase(fetchEmployees.rejected, (state, action) => { state.status = "failed"; state.error = action.error.message; })
      .addCase(createEmployee.fulfilled, (state, action) => { state.list.push(action.payload); state.createError = null; })
      .addCase(createEmployee.rejected, (state, action) => { state.createError = action.payload; })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const idx = state.list.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload };
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.list = state.list.filter((e) => e.id !== action.payload);
      });
  },
});

export const { clearCreateError } = employeesSlice.actions;
export default employeesSlice.reducer;
