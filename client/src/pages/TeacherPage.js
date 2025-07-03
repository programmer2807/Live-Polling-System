import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import ChatPopup from '../components/ChatPopup';

const TeacherPage = () => {
  const socket = useContext(SocketContext);

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [isPollActive, setIsPollActive] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [results, setResults] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [showStudents, setShowStudents] = useState(false);

  useEffect(() => {
    socket.on('pollResults', (data) => {
      setResults(data);
      setIsPollActive(false);
    });

    socket.on('participants', (data) => {
      setParticipants(data);
    });

    return () => {
      socket.off('pollResults');
      socket.off('participants');
    };
  }, [socket]);

  const handleOptionChange = (value, index) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 4) setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const askQuestion = () => {
    if (!question || options.some((opt) => !opt)) {
      alert("Please complete the question and all options.");
      return;
    }

    socket.emit('askQuestion', {
      question,
      options,
      correct: correctAnswer,
      duration: selectedDuration,
    });

    setIsPollActive(true);
    setResults(null);
  };

  const kickStudent = (name) => {
    socket.emit('kickStudent', name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-100 px-6 py-8 relative">
      {/* Top-right button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowStudents(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          👥 View Students ({participants.length})
        </button>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-indigo-800 mb-8 text-center">📊 Teacher Dashboard</h1>

      {/* Main Panel */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-1 gap-8 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Create a New Poll</h2>

        <input
          type="text"
          placeholder="Enter your question"
          className="w-full border px-4 py-2 rounded-md"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isPollActive}
        />

        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                className="flex-1 border px-4 py-2 rounded-md"
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(e.target.value, idx)}
                disabled={isPollActive}
              />
              <input
                type="radio"
                name="correct"
                value={opt}
                checked={correctAnswer === opt}
                onChange={() => setCorrectAnswer(opt)}
                disabled={isPollActive}
                title="Mark as correct"
              />
              {!isPollActive && options.length > 2 && (
                <button
                  onClick={() => removeOption(idx)}
                  className="text-red-500 hover:text-red-600 text-xl font-bold"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>

        {!isPollActive && options.length < 4 && (
          <button onClick={addOption} className="text-sm text-indigo-600 hover:underline">
            + Add Option
          </button>
        )}

        {/* Timer Dropdown */}
        <div className="pt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Select Timer Duration:</label>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(Number(e.target.value))}
              className="w-full border px-4 py-2 rounded-md"
              disabled={isPollActive}
            >
              <option value={30}>30 seconds</option>
              <option value={45}>45 seconds</option>
              <option value={60}>60 seconds</option>
            </select>
          </div>

          <div className="text-center">
            <button
              onClick={askQuestion}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
              disabled={isPollActive}
            >
              Ask Question
            </button>
          </div>
        </div>

        {/* Poll Results */}
        {results && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Poll Results</h3>
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
    className="h-4 bg-green-500 rounded"
    style={{ width: `${(count / total) * 100}%` }}
  ></div>
</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chat */}
      <ChatPopup username={'Teacher'} />

      {/* Modal for Students */}
      {showStudents && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-indigo-700">Connected Students</h2>
              <button onClick={() => setShowStudents(false)} className="text-gray-500 text-lg">&times;</button>
            </div>
            {participants.length === 0 ? (
              <p className="text-sm text-gray-600">No students connected.</p>
            ) : (
              <ul className="space-y-2">
                {participants.map((name, idx) => (
                  <li key={idx} className="flex justify-between items-center border-b pb-1">
                    <span className="text-gray-800">{name}</span>
                    <button
                      onClick={() => kickStudent(name)}
                      className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
                    >
                      Kick Out
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
     </div>
  );
};

export default TeacherPage;