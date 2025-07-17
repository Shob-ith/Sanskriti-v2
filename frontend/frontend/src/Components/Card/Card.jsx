import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Card({
  id = '',
  imageUrl = '',
  title = '',
  description = '',
  price = '',
  seller_id = '',
  link = '#',
  disableCart = false // ✅ New prop to hide "Add to Cart" for dummy cards
}) {
  const navigate = useNavigate();
  let user = null;
  let isSeller = false;
  let isBuyer = false;

  try {
    user = JSON.parse(localStorage.getItem('user'));
    isSeller = user?.role === 'seller' && user?.id === seller_id;
    isBuyer = user?.role === 'buyer';
  } catch (e) {
    console.warn('Invalid user data in localStorage:', e);
  }

  const handleAddToCart = async () => {
    if (!user) return alert('Please log in first!');
    if (!id || id.startsWith('category-') || id === 'manage') {
      return alert('This item is not available for adding to cart.');
    }

    try {
      const res = await fetch('https://sanskriti-nld4.onrender.com/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyer_id: user.id, art_id: id })
      });
      const result = await res.json();
      alert(result.message || result.error);
    } catch (err) {
      console.error('Add to cart failed:', err);
      alert('Failed to add to cart');
    }
  };

  return (
    <div
      className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-500 dark:hover:bg-gray-700"
      style={{ backgroundColor: '#002028' }}
    >
      {link && !isSeller ? (
        <Link
          to={link}
          className="flex flex-col md:flex-row w-full no-underline"
          style={{ textDecoration: 'none' }}
        >
          <CardContent title={title} imageUrl={imageUrl} description={description} price={price} />
        </Link>
      ) : (
        <div className="flex flex-col md:flex-row w-full">
          <CardContent title={title} imageUrl={imageUrl} description={description} price={price} />
        </div>
      )}

      {isSeller && (
        <Link
  to={`/app/seller/edit-art/${id}`}
  className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full text-sm mt-2 mb-2"
  title="Edit your art"
>
  ✏️
</Link>

      )}

      {isBuyer && !disableCart && (
        <button
          onClick={handleAddToCart}
          className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded mb-3"
        >
          🛒 Add to Cart
        </button>
      )}
    </div>
  );
}

const CardContent = ({ title, imageUrl, description, price }) => (
  <>
    <img
      className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
      src={imageUrl}
      alt={title}
    />
    <div className="flex flex-col justify-between p-4 leading-normal w-full">
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {title}
      </h5>
      <p className="mb-3 font-normal text-gray-300">{description}</p>
      {price && (
        <p className="text-lg font-semibold text-green-300">₹{price}</p>
      )}
    </div>
  </>
);

export default Card;
