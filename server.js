// Load environment variables from .env
require('dotenv').config();

// npm packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');

const app = express();

// Import routers
const authRouter = require('./controllers/auth');
const testJwtRouter = require('./controllers/test-jwt');
const usersRouter = require('./controllers/users');
const recipesRouter = require('./controllers/recipes');

// Debug: check if MONGO_URI is loaded
console.log("MONGO_URI from env is:", process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log(`Connected to MongoDB ${mongoose.connection.name}.`))
.catch(err => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(logger('dev'));

// Routes
app.use('/auth', authRouter);
app.use('/test-jwt', testJwtRouter);
app.use('/users', usersRouter);
app.use('/recipes', recipesRouter);

// Start the server
app.listen(3000, () => {
  console.log('The express app is ready!');
});
