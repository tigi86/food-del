import React, { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";

const FoodItem = ({ id, name, price, description, image }) => {
  const {
    cartItems = {},
    addToCart,
    removeFromCart,
    url,
  } = useContext(StoreContext);

  // Improved image URL handling
  const getImageUrl = () => {
    if (!image) return assets.placeholder_food; // Fallback if no image

    // If image is already a full URL (from Cloudinary)
    if (image.startsWith("http")) return image;

    // If image is just a filename (local uploads)
    return `${url}/uploads/${image}`; // Changed from '/images/' to '/uploads/'
  };

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img
          className="food-item-image"
          src={getImageUrl()}
          alt={name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = assets.placeholder_food;
          }}
        />
        {!cartItems[id] ? (
          <img
            className="add"
            onClick={() => addToCart(id)}
            src={assets.add_icon_white}
            alt="Add to cart"
          />
        ) : (
          <div className="food-item-counter">
            <img
              onClick={() => removeFromCart(id)}
              src={assets.remove_icon_red}
              alt="Remove item"
            />
            <p>{cartItems[id]}</p>
            <img
              onClick={() => addToCart(id)}
              src={assets.add_icon_green}
              alt="Add more"
            />
          </div>
        )}
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="Rating" />
        </div>
        <p className="food-item-desc">{description}</p>
        <p className="food-item-price">${price}</p>
      </div>
    </div>
  );
};

export default FoodItem;
