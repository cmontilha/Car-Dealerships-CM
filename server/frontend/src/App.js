import { useCallback, useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import "./App.css";

import AuthContext from "./context/AuthContext";
import LoginPanel from "./components/Login/Login";
import Register from "./components/Register/Register";
import CarInventory from "./components/Cars/CarInventory";
import CarDetail from "./components/Cars/CarDetail";
import Profile from "./components/Profile/Profile";

function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await fetch("/djangoapp/api/user/profile/", {
        credentials: "include",
      });
      if (!response.ok) {
        sessionStorage.removeItem("username");
        setUser(null);
        return null;
      }
      const data = await response.json();
      setUser(data.user);
      if (data.user?.username) {
        sessionStorage.setItem("username", data.user.username);
      }
      return data;
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const contextValue = useMemo(
    () => ({ user, setUser, refreshProfile, initializing }),
    [user, refreshProfile, initializing]
  );

  if (initializing) {
    return (
      <div className="app-loading d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      <Routes>
        <Route path="/" element={<CarInventory />} />
        <Route path="/dealers" element={<CarInventory />} />
        <Route path="/cars/:carId" element={<CarDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<LoginPanel />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
