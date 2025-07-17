import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setError('User not found. Please log in.');
      setLoading(false);
      return;
    }

    let parsedUser;
    try {
      parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (e) {
      console.error('Failed to parse user:', e);
      setError('User data is corrupted. Please log in again.');
      setLoading(false);
      return;
    }

    if (!parsedUser.id || parsedUser.role !== 'buyer') {
      setError('Cart is only available for buyers.');
      setLoading(false);
      return;
    }

    fetch(`https://sanskriti-nld4.onrender.com/cart/${parsedUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCartItems(data);
        } else if (Array.isArray(data.cart)) {
          setCartItems(data.cart);
        } else {
          setCartItems([]);
          setError('Unexpected response format from server.');
        }
      })
      .catch(err => {
        console.error('Cart fetch error:', err);
        setError('Failed to load cart. Try again later.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (cartId) => {
    try {
      const res = await fetch(`https://sanskriti-nld4.onrender.com/cart/remove/${cartId}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      alert(result.message || result.error);

      if (res.ok) {
        setCartItems(prev => prev.filter(item => item.id !== cartId));
      }
    } catch (err) {
      console.error('Remove item error:', err);
      alert('Failed to remove item from cart');
    }
  };

  const handleCheckout = () => {
    navigate('/app/checkout');
  };

  return (
    <div className="p-6 min-h-screen bg-[#FAF4EF]">
      <h2 className="text-3xl font-semibold text-center mb-6 text-[#6E1313]">🛒 Your Cart</h2>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : cartItems.length === 0 ? (
        <p className="text-center text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {cartItems.map(item => (
              <div
                key={item.id}
                className="bg-white shadow-md p-4 rounded-lg border border-gray-200"
              >
                <img
                  src={item.art?.image_url}
                  alt={item.art?.title || 'Artwork'}
                  className="h-40 w-full object-cover rounded"
                />
                <h3 className="mt-2 font-semibold text-xl">{item.art?.title || 'Untitled'}</h3>
                <p className="text-green-700 font-bold text-lg">₹{item.art?.price || 'N/A'}</p>
                <button
                  className="mt-3 text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={() => handleRemove(item.id)}
                >
                  ❌ Remove from Cart
                </button>
              </div>
            ))}
          </div>

          {user?.role === 'buyer' && cartItems.length > 0 && (
            <div className="text-center">
              <button
                onClick={handleCheckout}
                className="px-6 py-3 bg-[#6E1313] text-white font-bold rounded hover:bg-[#440000] transition"
              >
                ✅ Proceed to Checkout
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Cart;
