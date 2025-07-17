import React, { useState } from 'react';

function SellerDashboard() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    imageFile: null,
  });

  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user')); // Get seller_id from localStorage

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!user || !user.id) {
      setMessage('❌ Seller not logged in.');
      return;
    }

    const data = new FormData();
    data.append('seller_id', user.id);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('price', formData.price);
    data.append('image_file', formData.imageFile);

    try {
      const res = await fetch('https://sanskriti-nld4.onrender.com/add-art', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();

      if (res.ok) {
        setMessage('✅ Artwork uploaded successfully!');
        setFormData({
          title: '',
          description: '',
          category: '',
          price: '',
          imageFile: null,
        });
      } else {
        setMessage(`❌ ${result.error || 'Upload failed'}`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setMessage('❌ Failed to upload artwork.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-center mb-4 text-[#6E1313]">Upload Artwork</h2>

      {message && <p className="text-center mb-4 text-sm text-red-600">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold text-[#440000]">Artwork Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
            placeholder="Art title"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#440000]">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            required
            className="w-full p-2 border rounded"
            placeholder="Brief description of the artwork"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#440000]">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="e.g. Madhubani, Warli, Pattachitra"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#440000]">Price (INR)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
            placeholder="Price in ₹"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#440000]">Artwork Image (JPG/PNG)</label>
          <input
            type="file"
            name="imageFile"
            accept="image/*"
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#6E1313] text-white font-bold py-2 rounded hover:bg-[#440000]"
        >
          Upload
        </button>
      </form>
    </div>
  );
}

export default SellerDashboard;
