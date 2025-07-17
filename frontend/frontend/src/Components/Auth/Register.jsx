import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
    sellerImage: null,
  });

  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSendOtp = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return setError('Invalid email format.');
    }

    try {
      const res = await fetch('https://sanskriti-nld4.onrender.com/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('OTP sent to email.');
        setShowOtpInput(true);
        setError('');
      } else {
        setError(data.error || 'Failed to send OTP.');
      }
    } catch {
      setError('Error sending OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await fetch('https://sanskriti-nld4.onrender.com/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsEmailVerified(true);
        setSuccess('Email verified successfully.');
        setError('');
      } else {
        setError(data.error || 'OTP verification failed.');
      }
    } catch {
      setError('Error verifying OTP.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailVerified) return setError('Please verify your email with OTP.');
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      return setError('All fields are required.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords don't match.");
    }

    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('role', formData.role);
      if (formData.role === 'seller' && formData.sellerImage) {
        data.append('seller_image', formData.sellerImage);
      }

      const response = await fetch('https://sanskriti-nld4.onrender.com/register', {
        method: 'POST',
        body: data,
      });

      const resData = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(resData.user || { role: formData.role }));

        if (formData.role === 'seller') {
          navigate('/app/dashboard');
        } else {
          navigate('/app/cart');
        }
      } else {
        setError(resData.error || 'Registration failed.');
      }
    } catch {
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white/30 backdrop-blur-md p-10 rounded-xl shadow-lg z-20"
      >
        <h2 className="text-3xl font-bold text-center text-[#6E1313] mb-6">
          Register on <span className="text-[#440000]">Sanskriti</span>
        </h2>

        {error && <p className="text-red-600 text-sm mb-4 text-center font-medium">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4 text-center font-medium">{success}</p>}

        <div className="space-y-4">
          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E1313]"
            required
          />
          <input
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E1313]"
            required
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSendOtp}
              className="flex-1 py-2 px-4 bg-[#6E1313] text-white rounded-md hover:bg-[#440000] transition"
            >
              Send OTP
            </button>
            {showOtpInput && !isEmailVerified && (
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Verify OTP
              </button>
            )}
          </div>

          {showOtpInput && !isEmailVerified && (
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E1313]"
            />
          )}

          <input
            name="password"
            type="password"
            placeholder="Create Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E1313]"
            required
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E1313]"
            required
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg text-[#6E1313] focus:outline-none focus:ring-2 focus:ring-[#6E1313]"
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>

          {formData.role === 'seller' && (
            <div>
              <label className="text-sm text-[#440000] font-medium block mb-1">Upload Seller Image</label>
              <input
                type="file"
                name="sellerImage"
                accept="image/*"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#6E1313] text-white font-bold py-2 mt-4 rounded-lg hover:bg-[#440000] transition"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;
