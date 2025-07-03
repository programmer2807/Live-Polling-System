import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
import ChatPopup from '../components/ChatPopup';

const StudentPage = () => {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const [name, setName] = useState(sessionStorage.getItem('studentName') || '');
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(60);
  const [results, setResults] = useState(null);
  const [hasJoined, setHasJoined] = useState(!!sessionStorage.getItem('studentName'));

  useEffect(() => {
    if (hasJoined && name) {
      socket.emit('join', { name });
    }

    socket.on('newQuestion', (q) => {
      setQuestion(q);
      setSubmitted(false);
      setResults(null);
      setAnswer('');
      setTimer(q.duration || 60);
    });

    socket.on('pollResults', (data) => {
      setResults(data);
    });

    socket.on('kicked', () => {
      sessionStorage.clear();
      navigate('/kicked');
    });

    return () => {
      socket.off('newQuestion');
      socket.off('pollResults');
      socket.off('kicked');
    };
  }, [socket, name, navigate, hasJoined]);

  useEffect(() => {
    let interval = null;
    if (question && !submitted) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            setSubmitted(true);
            socket.emit('submitAnswer', { name, answer: '' });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [question, submitted, answer, socket, name]);

  const handleNameSubmit = () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      alert('Please enter a name with at least 3 characters.');
      return;
    }
    setName(trimmedName);
    sessionStorage.setItem('studentName', trimmedName);
    socket.emit('join', { name: trimmedName });
    setHasJoined(true);
  };

  const handleSubmit = () => {
    if (!submitted && answer) {
      socket.emit('submitAnswer', { name, answer });
      setSubmitted(true);
    }
  };

  const handleLeave = () => {
    sessionStorage.clear();
    navigate('/');
  };

  if (!hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-100 to-white">
        <div className="bg-white p-8 shadow-xl rounded-xl w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-4 text-indigo-700">Welcome Student</h1>
          <input
            className="border border-gray-300 w-full px-4 py-2 rounded-md mb-4"
            placeholder="Enter your name (min 3 characters)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            onClick={handleNameSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md w-full"
          >
            Join Poll
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-2xl mx-auto bg-indigo-50 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-bold text-indigo-800">Hello, {name}</h1>
          <button
            onClick={handleLeave}
            className="text-red-500 underline text-sm"
          >
            Leave Poll
          </button>
        </div>

        {!question && !results && (
          <p className="text-center text-gray-600 font-medium">Waiting for teacher to post a question...</p>
        )}

        {question && !submitted && (
          <>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Question:</h2>
              <span className="text-red-600 font-bold">⏱️ {timer}s</span>
            </div>
            <p className="text-gray-700 mb-4">{question.question}</p>

            <div className="space-y-2 mb-4">
              {question.options.map((opt, idx) => (
                <label key={idx} className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border hover:bg-indigo-100">
                  <input
                    type="radio"
                    value={opt}
                    checked={answer === opt}
                    onChange={() => setAnswer(opt)}
                    className="accent-indigo-600"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md w-full"
            >
              Submit Answer
            </button>
          </>
        )}

        {submitted && results && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Live Poll Results</h3>
            <p className="mb-3 font-medium">{results.question}</p>
            {Object.entries(results.results).map(([opt, count]) => {
              const total = Object.values(results.results).reduce((a, b) => a + b, 0) || 1;
              return (
                <div key={opt} className="mb-2">
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>{opt}</span>
                    <span>{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-4 rounded">
                    <div
                      className="h-4 bg-indigo-600 rounded"
                      style={{ width: `${(count / total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <ChatPopup username={name} />
    </div>
  );
};

export default StudentPage;
