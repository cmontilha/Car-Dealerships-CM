import React, { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import AuthContext from "../../context/AuthContext";
import "../assets/style.css";
import "../assets/bootstrap.min.css";

const Header = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async (event) => {
    event.preventDefault();
    if (loggingOut) {
      return;
    }
    setLoggingOut(true);
    try {
      await fetch("/djangoapp/api/logout/", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      // swallow network errors and still clear local state
    } finally {
      sessionStorage.removeItem("username");
      setUser(null);
      setLoggingOut(false);
      navigate("/", { replace: true });
    }
  };

  const displayName = user?.first_name?.trim()
    ? user.first_name
    : user?.username;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark primary-nav sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          Dealerships CM
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-lg-2">
            <li className="nav-item">
              <NavLink to="/" className="nav-link" end>
                Inventory
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/dealers" className="nav-link">
                Discover
              </NavLink>
            </li>
            {user && (
              <li className="nav-item">
                <NavLink to="/profile" className="nav-link">
                  My Profile
                </NavLink>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                <span className="text-white-50">
                  Hello, <strong>{displayName}</strong>
                </span>
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm" to="/login">
                  Login
                </Link>
                <Link className="btn btn-light btn-sm" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
