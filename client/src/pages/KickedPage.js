import React from 'react';
import { useNavigate } from 'react-router-dom';

const KickedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">You've been removed from the poll</h1>
        <p className="text-gray-600 mb-6">Please contact your teacher or try again later.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default KickedPage;
