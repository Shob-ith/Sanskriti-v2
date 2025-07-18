import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Checkout() {
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    zip: '',
    phone: '',
  });

  const [error, setError] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setError('User not found. Please log in again.');
      return;
    }

    let parsedUser;
    try {
      parsedUser = JSON.parse(storedUser);
      setUserEmail(parsedUser.email);
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e);
      setError('Corrupted user data. Please log in again.');
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await axios.get(
          `https://sanskriti-nld4.onrender.com/cart/${parsedUser.id}`
        );

        const cart = Array.isArray(response.data)
          ? response.data
          : response.data.cart || [];

        setCartItems(cart);

        const total = cart.reduce((sum, item) => sum + parseFloat(item.art?.price || 0), 0);
        setTotalAmount(total);
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError('Failed to fetch cart. Please try again later.');
      }
    };

    fetchCart();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fields = Object.values(shippingInfo).map((field) => field.trim());
    if (fields.includes('')) {
      setError('Please fill in all fields.');
      return;
    }

    if (cartItems.length === 0) {
      setError('Cart is empty. Cannot proceed to payment.');
      return;
    }

    setError('');

    navigate('/app/transaction', {
      state: {
        shippingInfo,
        cartItems,
        totalAmount,
        email: userEmail,
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 max-w-md mx-auto bg-white rounded shadow"
    >
      <h2 className="text-2xl mb-4 text-center font-semibold text-[#6E1313]">
        Checkout
      </h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {['name', 'address', 'city', 'zip', 'phone'].map((field) => (
        <div key={field} className="mb-4">
          <label className="block mb-2 font-medium text-gray-900 capitalize">
            {field === 'zip' ? 'Zip Code' : field === 'phone' ? 'Phone Number' : field}
          </label>
          <input
            name={field}
            value={shippingInfo[field]}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded text-gray-900"
            placeholder={
              field === 'zip'
                ? 'Zip Code'
                : field === 'phone'
                ? 'Phone Number'
                : field.charAt(0).toUpperCase() + field.slice(1)
            }
            required
          />
        </div>
      ))}

      <button
        type="submit"
        className="w-full mt-4 bg-[#6E1313] text-white font-bold py-3 rounded hover:bg-[#440000] transition"
      >
        Proceed to Payment
      </button>
    </form>
  );
}

export default Checkout;
