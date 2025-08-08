import React, { useState } from 'react';
import axiosInstance from '../axiosInstance'; // use your shared instance

const VerifyEmailButton = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const response = await axiosInstance.post(
        'https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/verify-email',
        {} // no body needed
      );

      const { message } = response.data;
      setStatus({ type: 'success', message });
    } catch (error) {
      console.error('❌ Verify Email error:', error);
      const errorMessage =
        error?.response?.data?.message || 'Unexpected error occurred';
      setStatus({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4">
      <button
        onClick={handleVerify}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Verify My Email'}
      </button>

      {status && (
        <p className={`mt-2 text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {status.message}
        </p>
      )}
    </div>
  );
};

export default VerifyEmailButton;
