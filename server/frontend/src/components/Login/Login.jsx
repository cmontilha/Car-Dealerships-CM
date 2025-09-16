import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthContext from "../../context/AuthContext";
import Header from "../Header/Header";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { user, setUser, refreshProfile } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/djangoapp/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.user) {
        setError(data.error || "Invalid username or password.");
        return;
      }

      sessionStorage.setItem("username", data.user.username);
      setUser(data.user);
      const profile = await refreshProfile();
      if (!profile) {
        setUser(data.user);
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError("Unable to sign in at the moment. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <Header />
      <div className="login-wrapper">
        <div className="login-card">
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">
            Sign in to comment on vehicles, like discussions and manage your favourites.
          </p>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                id="username"
                name="username"
                className="form-control"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Your username"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                minLength={8}
              />
            </div>
            <button className="btn btn-accent w-100" type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p className="login-footer">
            Don't have an account? <Link to="/register">Create one now</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
