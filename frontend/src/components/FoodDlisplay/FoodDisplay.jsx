import React, { useContext, useState, useEffect } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category }) => {
  const { food_list, fetchFoodList } = useContext(StoreContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await fetchFoodList();
      setLoading(false);
    };
    loadData();
  }, [fetchFoodList]);

  // Filter by category
  const filteredFoods = Array.isArray(food_list)
    ? food_list.filter(
        (item) => category === "All" || category === item.category
      )
    : [];

  if (loading) {
    return <div className="loading-message">Loading menu items...</div>;
  }

  return (
    <div className="food-display" id="food-display">
      <h2>Top Dishes Near You</h2>
      <div className="food-display-list">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
            />
          ))
        ) : (
          <div className="no-items-message">
            {food_list.length === 0
              ? "No food items available at the moment."
              : `No items found in ${category} category.`}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDisplay;
