// src/pages/CategoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../ProductCard/ProductCard.jsx';

function CategoryPage() {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const res = await fetch(`https://sanskriti-nld4.onrender.com/arts?category=${categoryName}`);
        const data = await res.json();
        if (res.ok) {
          setProducts(data.products || []);
        } else {
          setError(data.error || 'Failed to load category.');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError('Something went wrong while fetching category.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [categoryName]);

  return (
    <div className="px-6 py-12 min-h-screen bg-[#0F0000] text-white">
      <h2 className="text-3xl text-center mb-8 text-[#F4B3B3] font-serif capitalize tracking-wider drop-shadow-lg">
        {categoryName.replace(/-/g, ' ')} Collection
      </h2>

      {loading ? (
        <p className="text-center text-gray-300">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-300 text-lg">
          No products found in this category.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;
