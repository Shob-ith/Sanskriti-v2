import React, { useEffect, useState } from 'react';
import Card from '../Card/Card.jsx';

function Paintings() {
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('https://sanskriti-nld4.onrender.com/arts')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch artworks');
        return res.json();
      })
      .then(data => {
        const filtered = data.filter(art =>
  art.category?.toLowerCase().includes('painting')
);

        setPaintings(filtered);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load paintings.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 bg-[#FFF8F2] min-h-screen">
      <h1 className="text-3xl font-bold text-center text-[#6E1313] mb-8">
        Paintings Collection
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
          {paintings.length > 0 ? (
            paintings.map((art, i) => (
            <Card
              key={art.id || i}
              id={art.id} // ✅ Needed for Add to Cart
              seller_id={art.seller_id} // ✅ Needed for seller check
              title={art.title}
              imageUrl={art.image_url}
              description={`${art.description?.slice(0, 60) || ''}...`}
              price={art.price}
            />

            ))
          ) : (
            <p className="text-gray-500 italic col-span-full">
              No paintings available at the moment.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Paintings;
