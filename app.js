const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
// Middleware
app.use(cors());
app.use(express.json());
// Routes   
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
//app.use('/api/notes', require('./routes/notes'));
module.exports = app;