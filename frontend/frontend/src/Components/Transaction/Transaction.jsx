import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sanskriti-nld4.onrender.com";
const RAZORPAY_KEY = "rzp_test_KGRBZNHwU7a5RN"; // Replace with your Razorpay key

const Transaction = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Razorpay script once on mount
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      setScriptLoaded(true);
      console.log("Razorpay script loaded");
    };

    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      alert("Failed to load Razorpay payment system.");
    };

    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch cart data
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) throw new Error("User not found in localStorage.");

        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.id || parsedUser.role !== "buyer") {
          throw new Error("Invalid user role or missing ID.");
        }

        const res = await axios.get(`${BASE_URL}/cart/${parsedUser.id}`);
        const cart = Array.isArray(res.data) ? res.data : [];

        setCartItems(cart);
        const total = cart.reduce((sum, item) => sum + (item.art?.price || 0), 0);
        setTotalAmount(total);
      } catch (error) {
        console.error("Error fetching cart:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      alert("Payment system is not ready yet. Please wait...");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        alert("User not logged in.");
        return;
      }

      // Create Razorpay Order via backend
      const res = await axios.post(`${BASE_URL}/create-order`, {
        amount: totalAmount,
      });

      const { order } = res.data;
      if (!order || !order.id || !order.amount) {
        throw new Error("Invalid Razorpay order response.");
      }

      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "Sanskriti",
        description: "Purchase Traditional Art",
        order_id: order.id,
        handler: async function (response) {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

          try {
            await axios.post(`${BASE_URL}/save-transaction`, {
              payment_id: razorpay_payment_id,
              order_id: razorpay_order_id,
              signature: razorpay_signature,
              amount: order.amount,
              user_id: user.id,
              items: cartItems.map((item) => ({
                art_id: item.art_id,
              })),
            });

            alert("Payment successful and saved!");
            console.log("Transaction saved successfully.");
          } catch (error) {
            console.error("Failed to save transaction:", error);
            alert("Payment succeeded, but failed to save transaction.");
          }
        },
        prefill: {
          name: user.username || "Guest",
          email: user.email || "user@example.com",
        },
        theme: {
          color: "#F37254",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error during payment:", error.message);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
  <div className="p-8 min-h-screen bg-[var(--dark-bg)] text-white font-inter">
    <h2 className="text-3xl font-bold mb-8 text-center text-[var(--rose-pink)] font-philosopher">
      Your Transaction
    </h2>

    {loading ? (
      <p className="text-center text-[var(--text-muted)]">Loading...</p>
    ) : cartItems.length === 0 ? (
      <p className="text-center text-[var(--text-muted)]">Your cart is empty.</p>
    ) : (
      <>
        <div className="grid gap-6 max-w-3xl mx-auto">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="card p-6 flex justify-between items-center backdrop-blur bg-[var(--card-bg)] border border-[var(--rose-pink)]"
            >
              <div>
                <h3 className="text-xl font-semibold text-[var(--rose-pink)] font-marcellus">
                  {item.art?.title || "Untitled"}
                </h3>
                <p className="text-[var(--text-muted)]">₹{item.art?.price || 0}</p>
              </div>
              <img
                src={item.art?.image_url || "https://via.placeholder.com/100"}
                alt={item.art?.title || "Art"}
                className="h-20 w-20 object-cover rounded shadow-md"
              />
            </div>
          ))}
        </div>

        <div className="mt-10 text-2xl font-bold text-center text-[var(--rose-pink)] font-philosopher">
          Total: ₹{totalAmount}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={handlePayment}
            className="bg-[var(--rose-pink)] text-[var(--rich-black)] px-8 py-3 rounded-xl hover:scale-105 transition duration-300 font-semibold shadow-lg"
            disabled={!scriptLoaded}
          >
            {scriptLoaded ? "Pay Now" : "Loading Razorpay..."}
          </button>
        </div>
      </>
    )}
  </div>
);

};

export default Transaction;
