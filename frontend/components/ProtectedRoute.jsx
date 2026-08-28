// import { Navigate } from "react-router-dom";

// export default function ProtectedRoute({ children, allowedRoles }) {
//   const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
//   const role = localStorage.getItem("userRole");

//   if (!isLoggedIn) {
//     return <Navigate to="/login-admin" replace />;
//   }

//   if (allowedRoles && !allowedRoles.includes(role)) {
//     return <Navigate to="/login-admin" replace />;
//   }

//   return children;
// }

import { Navigate } from "react-router-dom";
import { clearSession } from "../utils/auth";

export default function ProtectedRoute({ children, allowedRoles }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("userRole");

  if (!isLoggedIn) {
    clearSession();
    return <Navigate to="/login-admin" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    clearSession();
    return <Navigate to="/login-admin" replace />;
  }

  return children;
}