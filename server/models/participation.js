const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    game_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
    joined_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Participation', participationSchema);