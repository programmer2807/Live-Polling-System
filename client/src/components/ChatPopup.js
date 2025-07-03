import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

const ChatPopup = ({ username }) => {
  const socket = useContext(SocketContext);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    socket.on('chatMessage', (data) => {
      setChatMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('chatMessage');
    };
  }, [socket]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('chatMessage', { name: username, message });
      setMessage('');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg"
      >
        {isOpen ? 'Close Chat' : 'Open Chat'}
      </button>

      {isOpen && (
        <div className="mt-2 w-80 bg-white border rounded-lg shadow-xl p-3 flex flex-col">
          <div className="h-48 overflow-y-auto mb-2 space-y-1">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className="text-sm">
                <strong className="text-indigo-600">{msg.name}:</strong> {msg.message}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border px-2 py-1 rounded-md text-sm"
              value={message}
              placeholder="Type your message..."
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-indigo-500 text-white px-3 py-1 rounded-md text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPopup;
