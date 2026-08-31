import { Navigate } from "react-router-dom";
import { clearSession } from "../utils/auth";

export default function ProtectedRoute({ children, allowedRoles, redirectTo = "/login-admin" }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("userRole");

  if (!isLoggedIn) {
    clearSession();
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    clearSession();
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}