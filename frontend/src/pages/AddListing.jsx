import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { listingsAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function AddListing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    course_code: "",
    price: "",
    condition: "Good",
    quantity: "1",
    description: "",
  });

  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!user || !user.userID) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      const fd = new FormData();

      // Add text inputs
      Object.entries(formData).forEach(([key, value]) => {
        fd.append(key, value);
      });

      // Correct seller_id
      fd.append("seller_id", user.userID);

      // Image
      if (image) {
        fd.append("image", image);
      }

      await listingsAPI.create(fd);

      alert("Listing created successfully!");
      navigate("/listings");

    } catch (err) {
      console.error("Create listing error:", err);
      setError(err.response?.data?.error || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sell Your Textbook</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Book Title"
          required
          className="w-full p-2 border rounded"
        />

        <input
          name="author"
          value={formData.author}
          onChange={handleChange}
          placeholder="Author"
          required
          className="w-full p-2 border rounded"
        />

        <input
          name="course_code"
          value={formData.course_code}
          onChange={handleChange}
          placeholder="Course Code (E.g., CSE101)"
          className="w-full p-2 border rounded"
        />

        <input
          name="price"
          type="number"
          min="1"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
          required
          className="w-full p-2 border rounded"
        />

        <input
          name="quantity"
          type="number"
          min="1"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="Quantity"
          required
          className="w-full p-2 border rounded"
        />

        <select
          name="condition"
          value={formData.condition}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="New">New</option>
          <option value="Like New">Like New</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
        </select>

        <div>
          <label className="font-medium block mb-2">Upload Book Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Uploading..." : "Create Listing"}
        </button>
      </form>
    </div>
  );
}
