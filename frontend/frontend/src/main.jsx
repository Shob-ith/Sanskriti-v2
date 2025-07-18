import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import AppWrapper from './Components/AppWrapper/AppWrapper.jsx';

import LandingLayout from './Components/LandingLayout/LandingLayout.jsx';
import AuthLayout from './Components/AuthLayout/AuthLayout.jsx';
import Layout from './Components/Layout/Layout.jsx';

import Welcome from './Components/Welcome/Welcome.jsx';
import Login from './Components/Auth/Login.jsx';
import Register from './Components/Auth/Register.jsx';
import SendOtp from './Components/Auth/SendOtp.jsx';

import Home from './Components/Home/Home.jsx';
import Shop from './Components/Shop/Shop.jsx';
import About from './Components/About/About.jsx';
import Contact from './Components/Contact/Contact.jsx';
import CategoryPage from './Components/CategoryPage/CategoryPage.jsx';
import Checkout from './Components/Checkout/Checkout.jsx';

import Transaction from './Components/Transaction/Transaction.jsx';

import SellerDashboard from './Components/Seller/SellerDashboard.jsx';
import EditArt from './Components/Seller/EditArt.jsx';
import Cart from './Components/Cart/Cart.jsx';

import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppWrapper />}>
      <Route element={<LandingLayout />}>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<SendOtp />} />
      </Route>
      

      <Route path="/app" element={<AuthLayout />}>
        <Route element={<Layout />}>
          <Route path="home" element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="category/:categoryName" element={<CategoryPage />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="transaction" element={<Transaction />} />
         

          {/* Seller Routes */}
          <Route path="dashboard" element={<SellerDashboard />} />
          <Route path="seller/edit-art" element={<EditArt />} />
          <Route path="seller/edit-art/:id" element={<EditArt />} />
        </Route>
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
