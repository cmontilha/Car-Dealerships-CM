import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthContext from "../../context/AuthContext";
import Header from "../Header/Header";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const { user, setUser, refreshProfile } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/djangoapp/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.user) {
        setError(data.error || "Unable to create your account. Please try again.");
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
      setError("Unexpected error while communicating with the server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <Header />
      <div className="register-wrapper">
        <div className="register-card">
          <h1 className="register-title">Create your account</h1>
          <p className="register-subtitle">
            Save favourite cars, manage your comments and enjoy a tailored experience.
          </p>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="registerUsername" className="form-label">
                  Username
                </label>
                <input
                  id="registerUsername"
                  className="form-control"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Choose a unique username"
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="registerEmail" className="form-label">
                  Email
                </label>
                <input
                  id="registerEmail"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="registerFirstName" className="form-label">
                  First name
                </label>
                <input
                  id="registerFirstName"
                  className="form-control"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Your first name"
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="registerLastName" className="form-label">
                  Last name
                </label>
                <input
                  id="registerLastName"
                  className="form-control"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Your last name"
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="registerPassword" className="form-label">
                  Password
                </label>
                <input
                  id="registerPassword"
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="registerConfirmPassword" className="form-label">
                  Confirm password
                </label>
                <input
                  id="registerConfirmPassword"
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat your password"
                  required
                  minLength={8}
                />
              </div>
            </div>
            <button className="btn btn-accent w-100 mt-4" type="submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>
          <p className="register-footer">
            Already have an account? <Link to="/login">Sign in here</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;