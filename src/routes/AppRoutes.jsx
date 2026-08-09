import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "../features/auth/Login";
import CustomerDashboard from "../features/dashboard/CustomerDashboard";
import EmployeeDashboard from "../features/dashboard/EmployeeDashboard";
import ManagerDashboard from "../features/dashboard/ManagerDashboard";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={["manager"]}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={<h2 style={{ padding: 24 }}>Unauthorized</h2>} />

      <Route
        path="/"
        element={<Navigate to={user ? `/${user.role}` : "/login"} replace />}
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;