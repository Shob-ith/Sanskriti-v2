import React from 'react';

function ProductCard({ id, seller_id, title, image_url, description, price }) {
  const handleAddToCart = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'buyer') {
      alert("Only buyers can add to cart.");
      return;
    }

    try {
      const res = await fetch('https://sanskriti-nld4.onrender.com/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          art_id: id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Added to cart!");
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (err) {
      console.error("Add to cart failed:", err);
      alert("❌ Something went wrong.");
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg overflow-hidden shadow-md hover:scale-105 transition-transform hover:shadow-lg hover:ring-2 hover:ring-[#F4B3B3]">
      <img
        src={image_url}
        alt={title}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
        }}
        className="w-full h-56 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl text-[#F4B3B3] font-semibold mb-1 truncate">{title}</h3>
        <p className="text-gray-300 text-sm mb-2 line-clamp-2">{description}</p>
        <p className="text-lg text-green-300 font-semibold mb-3">₹{price}</p>
        <button
          onClick={handleAddToCart}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800 w-full"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
