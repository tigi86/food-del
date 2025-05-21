import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } =
    useContext(StoreContext);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };
  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate all required fields
      const requiredFields = [
        "firstName",
        "lastName",
        "email",
        "street",
        "city",
        "state",
        "zipcode",
        "country",
        "phone",
      ];
      const missingFields = requiredFields.filter((field) => !data[field]);

      if (missingFields.length > 0) {
        throw new Error(`Please fill in: ${missingFields.join(", ")}`);
      }

      // Decode token to get user ID with validation
      let userId;
      try {
        const decodedToken = jwtDecode(token);
        userId = decodedToken.id;
        if (!userId) throw new Error("Invalid user token");
      } catch (decodeError) {
        throw new Error("Authentication failed. Please login again.");
      }

      // Prepare order items with validation
      const orderItems = food_list
        .filter((item) => cartItems[item._id] > 0)
        .map((item) => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: cartItems[item._id],
        }));

      if (orderItems.length === 0) {
        throw new Error("Your cart is empty");
      }

      const orderData = {
        userId,
        address: data,
        items: orderItems,
        amount: getTotalCartAmount() + 2,
      };

      // Add timeout to the request
      const response = await axios.post(`${url}/api/order/place`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Payment processing failed");
      }

      // Redirect to Stripe
      if (response.data.session_url) {
        window.location.replace(response.data.session_url);
      } else {
        navigate("/order-success", {
          state: { orderId: response.data.orderId },
        });
      }
    } catch (error) {
      console.error("Order error details:", error);

      let errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Order failed. Please try again.";

      // Handle specific error cases
      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
        localStorage.removeItem("token");
        navigate("/login");
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please check your connection.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const navigate = useNavigate();
  useEffect(() => {
    if (!token) {
      navigate("/cart");
    } else if (getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [token, getTotalCartAmount]);

  return (
    <form onSubmit={handlePlaceOrder} className="place-order">
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input
            required
            name="firstName"
            onChange={onChangeHandler}
            value={data.firstName}
            type="text"
            placeholder="First Name"
          />
          <input
            required
            name="lastName"
            onChange={onChangeHandler}
            value={data.lastName}
            type="text"
            placeholder="Last Name"
          />
        </div>
        <input
          required
          name="email"
          onChange={onChangeHandler}
          value={data.email}
          type="email"
          placeholder="Email address"
        />
        <input
          required
          name="street"
          onChange={onChangeHandler}
          value={data.street}
          type="text"
          placeholder="Street"
        />
        <div className="multi-fields">
          <input
            required
            name="city"
            onChange={onChangeHandler}
            value={data.city}
            type="text"
            placeholder="City"
          />
          <input
            required
            name="state"
            onChange={onChangeHandler}
            value={data.state}
            type="text"
            placeholder="State"
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name="zipcode"
            onChange={onChangeHandler}
            value={data.zipcode}
            type="text"
            placeholder="Zip code"
          />
          <input
            required
            name="country"
            onChange={onChangeHandler}
            value={data.country}
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          required
          name="phone"
          onChange={onChangeHandler}
          value={data.phone}
          type="tel"
          placeholder="Phone"
        />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Total</p>
              <p>
                ${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}
              </p>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Processing..." : "PROCEED TO PAYMENT"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
