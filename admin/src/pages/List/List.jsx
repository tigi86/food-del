import React, { useEffect, useState } from "react";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);

      console.log("API Response:", response.data); // Debug log

      if (response.data.success) {
        // Match the backend response structure
        setList(response.data.foods || []);
      } else {
        toast.error(response.data.message || "Failed to fetch list");
      }
    } catch (error) {
      console.error("Fetch error details:", {
        error: error.response?.data || error.message,
        status: error.response?.status,
      });
      toast.error("Failed to load food list. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, {
        id: foodId,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList(); // Refresh the list after removal
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove item");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  if (loading) return <div className="list add flex-col">Loading...</div>;

  return (
    <div className="list add flex-col">
      <p>All Food List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list?.length > 0 ? (
          list.map((item) => (
            <div key={item._id} className="list-table-format">
              <img
                src={item.image} // Directly use Cloudinary URL
                alt={item.name}
                onError={(e) => {
                  e.target.src = "placeholder-image-url"; // Fallback image
                }}
              />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>${item.price}</p>
              <button
                onClick={() => removeFood(item._id)}
                className="cursor remove-btn"
              >
                X
              </button>
            </div>
          ))
        ) : (
          <p className="no-items">No food items found</p>
        )}
      </div>
    </div>
  );
};

export default List;
