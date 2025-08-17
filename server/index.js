const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

// Middleware to use json body
app.use(express.json());

const mongodb_uri = "mongodb+srv://GJ_server:SWJR0t5h7B3eCSFN@cluster0.il10syb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

//Connecting to the MongoDB (Need to paste correct link and set up the db)
mongoose.connect(mongodb_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
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