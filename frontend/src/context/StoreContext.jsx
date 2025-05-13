import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "http://localhost:4000";
  const [token, setToken] = useState("");
  const [food_list, setFood_list] = useState([]);

  const addToCart = async (itemId) => {
    try {
      if (!itemId) {
        console.error("Invalid itemId:", itemId);
        return;
      }

      // Update local state first for immediate UI response
      setCartItems((prev) => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1,
      }));

      // Sync with backend if authenticated
      if (token) {
        await axios.post(
          url + "/api/cart/add",
          { itemId },
          { headers: { token } }
        );
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Revert local state if API call fails
      setCartItems((prev) => ({
        ...prev,
        [itemId]: (prev[itemId] || 1) - 1,
      }));
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      if (!itemId || !cartItems[itemId]) {
        console.error("Invalid itemId or item not in cart:", itemId);
        return;
      }

      // Update local state first
      setCartItems((prev) => ({
        ...prev,
        [itemId]: prev[itemId] - 1,
      }));

      // Sync with backend if authenticated
      if (token) {
        await axios.post(
          url + "/api/cart/remove",
          { itemId },
          { headers: { token } }
        );
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      // Revert local state if API call fails
      setCartItems((prev) => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1,
      }));
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

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      setFood_list(response.data.data || []);
    } catch (error) {
      console.error("Error fetching food list:", error);
      setFood_list([]);
    }
  };

  const loadCartData = async (token) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get",
        {},
        { headers: { token } }
      );
      setCartItems(response.data.cartData || {});
    } catch (error) {
      console.error("Error loading cart data:", error);
      setCartItems({});
    }
  };

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        await loadCartData(storedToken);
      }
    }
    loadData();
  }, []);

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
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
