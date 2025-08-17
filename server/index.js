const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

const PORT = process.env.PORT

// Middleware to use json body
app.use(express.json());

const mongodb_uri = process.env.DB_URL;

//Connecting to the MongoDB (Need to paste correct link and set up the db)
mongoose.connect(mongodb_uri)
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1); // Exit if connection fails
});

//ROUTERS
const auth = require('./routes/auth');
const game = require('./routes/game');

app.use('/auth', auth);
app.use('/', game)

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
})