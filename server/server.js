const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let currentQuestion = null;
let responses = {};
let students = new Map();
let kickedStudents = new Set();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', ({ name }) => {
    if (kickedStudents.has(name)) {
      socket.emit('kicked');
      return;
    }
    students.set(socket.id, name);
    io.emit('participants', Array.from(students.values()));
  });

  socket.on('askQuestion', (questionData) => {
    if (!questionData || !questionData.question || !questionData.options) return;

    currentQuestion = {
      question: questionData.question,
      options: questionData.options,
      correct: questionData.correct || '',
      duration: questionData.duration || 60,
    };

    responses = {};
    io.emit('newQuestion', currentQuestion);
  });

  socket.on('submitAnswer', ({ name, answer }) => {
    responses[name] = answer;
    if (Object.keys(responses).length >= students.size) {
      io.emit('pollResults', generateResults());
      currentQuestion = null;
    }
  });

  socket.on('kickStudent', (name) => {
    kickedStudents.add(name);
    for (let [id, studentName] of students.entries()) {
      if (studentName === name) {
        io.to(id).emit('kicked');
        students.delete(id);
        break;
      }
    }
    io.emit('participants', Array.from(students.values()));
  });

  socket.on('disconnect', () => {
    students.delete(socket.id);
    io.emit('participants', Array.from(students.values()));
  });
});

function generateResults() {
  const result = {};
  for (const opt of currentQuestion.options) result[opt] = 0;
  for (const ans of Object.values(responses)) {
    if (result.hasOwnProperty(ans)) {
      result[ans] += 1;
    }
  }
  return {
    question: currentQuestion.question,
    results: result,
    correct: currentQuestion.correct || null,
  };
}

server.listen(4000, () => {
  console.log('Server running on port 4000');
});
