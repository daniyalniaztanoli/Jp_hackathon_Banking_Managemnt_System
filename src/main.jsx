import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config.js";
import store from "./app/store.js";
import theme from "./theme/theme.js";
import App from "./App.jsx";
import "./index.css";
import axiosInstance from "./api/axiosInstance.js";

const findUserRole = async (email) => {
  const [customers, employees, managers] = await Promise.all([
    axiosInstance.get(`/customers?email=${email}`),
    axiosInstance.get(`/employees?email=${email}`),
    axiosInstance.get(`/managers?email=${email}`),
  ]);
  if (customers.data.length) return { role: "customer", profile: customers.data[0] };
  if (employees.data.length) return { role: "employee", profile: employees.data[0] };
  if (managers.data.length) return { role: "manager", profile: managers.data[0] };
  return null;
};

const restoreAuth = () =>
  new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribe();
      if (firebaseUser) {
        try {
          const result = await findUserRole(firebaseUser.email);
          if (result) {
            store.dispatch({
              type: "auth/loginUser/fulfilled",
              payload: { uid: firebaseUser.uid, email: firebaseUser.email, ...result },
            });
          }
        } catch (_) {}
      }
      resolve();
    });
  });

restoreAuth().then(() => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </StrictMode>
  );
});
