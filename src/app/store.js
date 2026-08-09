import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import customersReducer from "../features/customers/customersSlice";
import transactionsReducer from "../features/transactions/transactionsSlice";
import loansReducer from "../features/loans/loansSlice";
import employeesReducer from "../features/employees/employeesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customersReducer,
    transactions: transactionsReducer,
    loans: loansReducer,
    employees: employeesReducer,
  },
});

export default store;
