import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

function EditArt() {
  const { id: artId } = useParams();
  const navigate = useNavigate();
  const seller = JSON.parse(localStorage.getItem('user'));

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
  });

  const [originalData, setOriginalData] = useState({});
  const [sellerArts, setSellerArts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch seller's artworks
  useEffect(() => {
    if (!seller?.id) return;
    fetch(`https://sanskriti-nld4.onrender.com/arts/seller/${seller.id}`)
      .then(res => res.json())
      .then(data => setSellerArts(data))
      .catch(err => console.error("Failed to fetch seller artworks:", err));
  }, [seller]);

  // Fetch selected art for editing
  useEffect(() => {
    if (!artId) {
      setLoading(false);
      return;
    }

    fetch(`https://sanskriti-nld4.onrender.com/arts/${artId}`)
      .then(res => res.json())
      .then(data => {
        setForm(data);
        setOriginalData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch artwork:", err);
        setLoading(false);
      });
  }, [artId]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const seller_id = seller.id;

    const updatedData = {};
    for (let key in form) {
      updatedData[key] = form[key] === '' ? originalData[key] : form[key];
    }

    try {
      const res = await fetch(`https://sanskriti-nld4.onrender.com/update-art/${artId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedData, seller_id }),
      });
      const result = await res.json();
      alert(result.message || result.error);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update artwork");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this artwork?")) return;

    try {
      const res = await fetch(`https://sanskriti-nld4.onrender.com/delete-art/${artId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seller_id: seller.id })
      });
      const result = await res.json();
      alert(result.message || result.error);
      navigate("/app/shop");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete artwork");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-3xl font-semibold mb-4 text-center">Manage Your Arts</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {sellerArts.map((art) => (
          <Link
            to={`/app/seller/edit-art/${art.id}`}
            key={art.id}
            className="p-4 border rounded shadow hover:bg-gray-100"
          >
            <p className="font-bold">{art.title}</p>
            <p className="text-sm text-gray-600">₹{art.price}</p>
          </Link>
        ))}
      </div>

      {artId && !loading && (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-6 space-y-4">
          <h3 className="text-xl font-bold text-center">Edit Artwork</h3>

          <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="w-full border p-2 rounded" />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full border p-2 rounded" />
          <input name="price" value={form.price} onChange={handleChange} placeholder="Price" className="w-full border p-2 rounded" />
          <input name="image_url" value={form.image_url} onChange={handleChange} placeholder="Image URL" className="w-full border p-2 rounded" />
          <select name="category" value={form.category} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Select category</option>
            <option value="Paintings">Paintings</option>
            <option value="Sculptures">Sculptures</option>
          </select>

          <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Artwork</button>
          <button type="button" onClick={handleDelete} className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete Artwork</button>
        </form>
      )}
    </div>
  );
}

export default EditArt;
