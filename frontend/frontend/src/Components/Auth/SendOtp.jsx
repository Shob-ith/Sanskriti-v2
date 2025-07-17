import React, { useState } from 'react';

function SendOtp() {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSend = async () => {
    const res = await fetch('https://sanskriti-nld4.onrender.com/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const result = await res.json();
    alert(result.message || result.error);
    if (res.ok) setOtpSent(true);
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button onClick={handleSend}>Send OTP</button>

      {otpSent && <VerifyOtp email={email} />}
    </div>
  );
}

function VerifyOtp({ email }) {
  const [otp, setOtp] = useState('');

  const handleVerify = async () => {
    const res = await fetch('https://sanskriti-nld4.onrender.com/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const result = await res.json();
    alert(result.message || result.error);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={e => setOtp(e.target.value)}
      />
      <button onClick={handleVerify}>Verify OTP</button>
    </div>
  );
}

export default SendOtp;
