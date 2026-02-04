import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminGuard({ children }) {
  const [allowed, setAllowed] = useState(() => {
    // Initial check for token
    return localStorage.getItem("accessToken") ? null : false;
  });

  useEffect(() => {
    // If no token, already handled in state initialization
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }

    api
      .get("/me/")
      .then(() => setAllowed(true))
      .catch(() => {
        // Token might be expired, try refreshing or logout
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setAllowed(false);
      });
  }, []);

  if (allowed === null)
    return <div className="p-10 text-center text-white">Loading...</div>; // Simple loading state
  return allowed ? children : <Navigate to="/403" />;
}
