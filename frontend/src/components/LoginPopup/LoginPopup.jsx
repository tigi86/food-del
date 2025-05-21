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
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));

    // Clear errors when typing
    if (name === "newPassword" || name === "confirmPassword") {
      setPasswordError("");
    }
    if (errorMessage) setErrorMessage("");
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const onLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Forgot Password flow
      if (currState === "Forgot Password") {
        if (!isVerified) {
          // First step - verify user
          if (!data.name || !data.email) {
            setErrorMessage("Please fill in all fields");
            return;
          }

          const response = await axios.post(
            `${url}/api/user/verify-forgot-password`,
            {
              name: data.name,
              email: data.email,
            }
          );

          if (response.data.success) {
            setIsVerified(true);
          } else {
            setErrorMessage(response.data.message || "Verification failed");
          }
          return;
        }

        // Second step - update password
        if (data.newPassword !== data.confirmPassword) {
          setPasswordError("Passwords do not match");
          return;
        }

        if (!validatePassword(data.newPassword)) {
          setPasswordError("Password must be at least 8 characters");
          return;
        }

        const response = await axios.post(`${url}/api/user/reset-password`, {
          email: data.email,
          newPassword: data.newPassword,
        });

        if (response.data.success) {
          alert(
            "Password updated successfully! Please login with your new password."
          );
          setCurrState("Login");
          resetForm();
        } else {
          setErrorMessage(response.data.message || "Password update failed");
        }
        return;
      }

      // Login/Signup validation
      if (!data.email || !validateEmail(data.email)) {
        setErrorMessage("Please enter a valid email");
        return;
      }

      if (currState !== "Login" && !data.name) {
        setErrorMessage("Please enter your name");
        return;
      }

      if (!data.password || !validatePassword(data.password)) {
        setErrorMessage("Password must be at least 8 characters");
        return;
      }

      // Make API request
      const endpoint = currState === "Login" ? "login" : "register";
      const response = await axios.post(`${url}/api/user/${endpoint}`, {
        email: data.email,
        password: data.password,
        ...(currState !== "Login" && { name: data.name }),
      });

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        setShowLogin(false);
      } else {
        setErrorMessage(response.data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setData({
      name: "",
      email: "",
      password: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordError("");
    setIsVerified(false);
    setErrorMessage("");
  };

  const handleForgotPassword = () => {
    setCurrState("Forgot Password");
    resetForm();
  };

  const switchState = (newState) => {
    setCurrState(newState);
    resetForm();
  };

  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt="Close"
          />
        </div>

        {errorMessage && (
          <div className="login-error-message">{errorMessage}</div>
        )}

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
                placeholder="Password (min 8 characters)"
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
                    placeholder="New Password (min 8 characters)"
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

        <button type="submit" disabled={isLoading}>
          {isLoading
            ? "Processing..."
            : currState === "Sign Up"
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
            <span onClick={() => switchState("Sign Up")}>Click here</span>
          </p>
        ) : currState === "Sign Up" ? (
          <p>
            Already have an account?{" "}
            <span onClick={() => switchState("Login")}>Login here</span>
          </p>
        ) : (
          <p>
            Remember your password?{" "}
            <span onClick={() => switchState("Login")}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
