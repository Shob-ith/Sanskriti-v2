import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CartSummary() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    fetch(`https://sanskriti-nld4.onrender.com/cart/${user.id}`)
      .then(res => res.json())
      .then(data => setCartItems(data))
      .catch(err => console.error("Failed to fetch cart:", err))
      .finally(() => setLoading(false));
  }, [user]);

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.art?.price || 0), 0);

  if (!user) return <p className="text-center mt-10">Please log in to view your cart summary.</p>;

  return (
    <div className="min-h-screen p-6 bg-[#0F0000] text-white">
      <h2 className="text-3xl font-bold mb-6 text-center text-[#F4B3B3]">🧾 Cart Summary</h2>

      {loading ? (
        <p className="text-center text-white/70">Loading...</p>
      ) : cartItems.length === 0 ? (
        <p className="text-center text-white/60">Your cart is empty.</p>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 bg-white/10 backdrop-blur p-4 rounded border border-[#6E1313] shadow">
              <img
                src={item.art?.image_url}
                alt={item.art?.title}
                className="w-24 h-24 object-cover rounded"
              />
              <div>
                <h3 className="text-xl font-semibold text-[#F4B3B3]">{item.art?.title}</h3>
                <p className="text-green-300 font-medium">₹{item.art?.price}</p>
              </div>
            </div>
          ))}

          <div className="border-t border-[#F4B3B3]/30 pt-6">
            <h3 className="text-2xl font-bold text-right text-[#F4B3B3]">
              Total: ₹{totalPrice}
            </h3>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => navigate('/app/cart')}
              className="px-4 py-2 bg-[#F4B3B3] text-black font-semibold rounded hover:bg-[#e8a3a3]"
            >
              ⬅ Back to Cart
            </button>
            <button
              onClick={() => navigate('/app/checkout')}
              className="px-4 py-2 bg-[#6E1313] text-white font-semibold rounded hover:bg-[#440000]"
            >
              ✅ Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartSummary;
