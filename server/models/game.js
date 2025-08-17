const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  address: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
}, { _id: false });

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  host_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: locationSchema, required: true },
  date_time: { type: Date, required: true },
  skill_level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner', required: true },
  max_players: { type: Number, required: true },

  // 🔥 New Field: participants array
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
}, { timestamps: { createdAt: 'created_at' } });

module.exports = mongoose.model('Game', gameSchema);
