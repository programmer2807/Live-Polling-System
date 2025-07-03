import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');

  const handleContinue = () => {
    if (selectedRole) navigate(`/${selectedRole}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-3xl w-full text-center">
       
        <div className="mb-4">
          <span className="inline-block bg-purple-600 text-white text-sm font-medium px-3 py-1 rounded-full">
             Intervue Poll
          </span>
        </div>

      
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Welcome to the <span className="text-black font-extrabold">Live Polling System</span>
        </h1>
        <p className="text-gray-500 mt-2 mb-8">
          Please select the role that best describes you to begin using the live polling system
        </p>

       
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
          <div
            onClick={() => setSelectedRole('student')}
            className={`w-full md:w-64 p-6 rounded-xl border cursor-pointer transition ${
              selectedRole === 'student'
                ? 'border-indigo-600 shadow-lg'
                : 'border-gray-300 hover:shadow'
            }`}
          >
            <h2 className="font-semibold text-lg mb-1">I’m a Student</h2>
            <p className="text-sm text-gray-500">
              Student data and participate in polls by becoming a student.
            </p>
          </div>

          <div
            onClick={() => setSelectedRole('teacher')}
            className={`w-full md:w-64 p-6 rounded-xl border cursor-pointer transition ${
              selectedRole === 'teacher'
                ? 'border-indigo-600 shadow-lg'
                : 'border-gray-300 hover:shadow'
            }`}
          >
            <h2 className="font-semibold text-lg mb-1">I’m a Teacher</h2>
            <p className="text-sm text-gray-500">
              Conduct Polls for the students and check their knowledge
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`px-6 py-3 rounded-full text-white text-base font-semibold transition ${
            selectedRole
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-indigo-200 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default HomePage;
