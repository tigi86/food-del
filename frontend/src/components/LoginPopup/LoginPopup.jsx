import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext);
  const [currState, setCurrState] = useState("Login"); // Can be "Login", "Sign Up", or "Forgot Password"
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isVerified, setIsVerified] = useState(false); // New state to track verification

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));

    // Clear password error when user types
    if (name === "newPassword" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const onLogin = async (event) => {
    event.preventDefault();

    // For forgot password flow
    if (currState === "Forgot Password") {
      // Check if we're in the first step (verifying user) or second step (updating password)
      if (!isVerified) {
        // First step - verify user
        try {
          const response = await axios.post(
            `${url}/api/user/verify-forgot-password`,
            {
              name: data.name,
              email: data.email,
            }
          );
          if (response.data.success) {
            // User verified, show password fields
            setIsVerified(true);
            setData((prev) => ({
              ...prev,
              newPassword: "",
              confirmPassword: "",
            }));
          } else {
            alert(response.data.message);
          }
        } catch (error) {
          alert("Error verifying user. Please try again.");
        }
        return;
      }

      // Second step - update password
      if (data.newPassword !== data.confirmPassword) {
        setPasswordError("Passwords do not match");
        return;
      }

      try {
        const response = await axios.post(`${url}/api/user/reset-password`, {
          email: data.email,
          newPassword: data.newPassword,
        });
        if (response.data.success) {
          alert(
            "Password updated successfully! Please login with your new password."
          );
          setCurrState("Login");
          setIsVerified(false);
          setData({
            name: "",
            email: "",
            password: "",
            newPassword: "",
            confirmPassword: "",
          });
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        alert("Error updating password. Please try again.");
      }
      return;
    }

    // Original login/signup logic
    let newUrl = url;
    if (currState === "Login") {
      newUrl += "/api/user/login";
    } else {
      newUrl += "/api/user/register";
    }

    const response = await axios.post(newUrl, data);
    if (response.data.success) {
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      setShowLogin(false);
    } else {
      alert(response.data.message);
    }
  };

  const handleForgotPassword = () => {
    setCurrState("Forgot Password");
    setIsVerified(false); // Reset verification state
    setData({
      name: "",
      email: "",
      password: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordError("");
  };

  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt=""
          />
        </div>

        <div className="login-popup-input">
          {currState === "Login" ? (
            <>
              <input
                name="email"
                onChange={onChangeHandler}
                value={data.email}
                type="email"
                placeholder="Your Email"
                required
              />
              <input
                name="password"
                onChange={onChangeHandler}
                value={data.password}
                type="password"
                placeholder="Password"
                required
              />
              <p className="forgot-password" onClick={handleForgotPassword}>
                Forgot password? <span>Click here</span>
              </p>
            </>
          ) : currState === "Sign Up" ? (
            <>
              <input
                name="name"
                onChange={onChangeHandler}
                value={data.name}
                type="text"
                placeholder="Your name"
                required
              />
              <input
                name="email"
                onChange={onChangeHandler}
                value={data.email}
                type="email"
                placeholder="Your Email"
                required
              />
              <input
                name="password"
                onChange={onChangeHandler}
                value={data.password}
                type="password"
                placeholder="Password"
                required
              />
            </>
          ) : (
            // Forgot Password flow
            <>
              {!isVerified ? (
                // First step - verify user
                <>
                  <input
                    name="name"
                    onChange={onChangeHandler}
                    value={data.name}
                    type="text"
                    placeholder="Your name"
                    required
                  />
                  <input
                    name="email"
                    onChange={onChangeHandler}
                    value={data.email}
                    type="email"
                    placeholder="Your Email"
                    required
                  />
                </>
              ) : (
                // Second step - update password
                <>
                  <input
                    name="newPassword"
                    onChange={onChangeHandler}
                    value={data.newPassword}
                    type="password"
                    placeholder="New Password"
                    required
                  />
                  <input
                    name="confirmPassword"
                    onChange={onChangeHandler}
                    value={data.confirmPassword}
                    type="password"
                    placeholder="Confirm Password"
                    required
                    style={{ borderColor: passwordError ? "red" : "" }}
                  />
                  {passwordError && (
                    <p style={{ color: "red", marginTop: "-15px" }}>
                      {passwordError}
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <button type="submit">
          {currState === "Sign Up"
            ? "Create account"
            : currState === "Forgot Password"
            ? isVerified
              ? "Update Password"
              : "Verify"
            : "Login"}
        </button>

        {currState !== "Forgot Password" && (
          <div className="login-popup-condition">
            <input type="checkbox" required />
            <p>By continuing, I agree to the terms of use & privacy policy</p>
          </div>
        )}

        {currState === "Login" ? (
          <p>
            Create a new account?{" "}
            <span onClick={() => setCurrState("Sign Up")}>Click here</span>
          </p>
        ) : currState === "Sign Up" ? (
          <p>
            Already have an account?{" "}
            <span onClick={() => setCurrState("Login")}>Login here</span>
          </p>
        ) : (
          <p>
            Remember your password?{" "}
            <span
              onClick={() => {
                setCurrState("Login");
                setIsVerified(false);
              }}
            >
              Login here
            </span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
