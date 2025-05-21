import axios from "axios";
import { createContext, useEffect, useState } from "react";
import * as jwt_decode from "jwt-decode";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "http://localhost:4000";
  const [token, setToken] = useState("");
  const [food_list, setFood_list] = useState([]);

  const addToCart = async (itemId) => {
    if (!itemId) return;

    const newCart = { ...cartItems, [itemId]: (cartItems[itemId] || 0) + 1 };
    setCartItems(newCart);

    try {
      if (token) {
        const response = await axios.post(
          `${url}/api/cart/add`,
          { itemId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to update cart");
        }
      }
    } catch (error) {
      // Revert on error
      setCartItems((prev) => ({
        ...prev,
        [itemId]: Math.max(0, (prev[itemId] || 0) - 1),
      }));
      toast.error(error.message || "Failed to add to cart");
    }
  };
  const removeFromCart = async (itemId) => {
    if (!itemId || !cartItems[itemId]) return;

    const newCart = { ...cartItems };
    if (newCart[itemId] > 1) {
      newCart[itemId] -= 1;
    } else {
      delete newCart[itemId];
    }
    setCartItems(newCart);

    try {
      if (token) {
        const response = await axios.post(
          `${url}/api/cart/remove`,
          { itemId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to update cart");
        }
      }
    } catch (error) {
      // Revert on error
      setCartItems(cartItems);
      toast.error(error.message || "Failed to remove from cart");
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };
  const [loading, setLoading] = useState(false);

  const fetchFoodList = async () => {
    if (loading) return; // Prevent concurrent requests

    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/food/list`);
      const foodData = response.data?.foods || [];
      setFood_list(foodData);
    } catch (error) {
      console.error("Error fetching food list:", error);
      setFood_list([]);
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const loadCartData = async (token) => {
    try {
      if (!token) {
        setCartItems({});
        return;
      }

      const response = await axios.get(`${url}/api/cart/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      });

      if (response.data.success) {
        setCartItems(response.data.cartData || {});
      } else {
        console.error("Cart load failed:", response.data.message);
        setCartItems({});
      }
    } catch (error) {
      console.error("Cart load error:", error);
      setCartItems({});

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setToken("");
      }
    }
  };
  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const decoded = jwt_decode.default(storedToken);
          // Verify token has required structure
          if (decoded && decoded.id && decoded.exp * 1000 > Date.now()) {
            setToken(storedToken);
            await loadCartData(storedToken);
          } else {
            localStorage.removeItem("token");
          }
        } catch (e) {
          localStorage.removeItem("token");
        }
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (token) {
      loadCartData(token);
    }
  }, [token]);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    fetchFoodList,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
