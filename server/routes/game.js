const express = require('express');
const mongoose = require('mongoose');

const Game = require('../models/game');

const router = express.Router();

const authRequired = require('../middlewares/authRequired');
const requireRole = require('../middlewares/requireRole');


router.use(authRequired);

/** 
 * GET /games
 * Query params:
 *  - skill_level (beginner, intermediate, advanced)
 * 
 */
router.get('/game', authRequired, async (req, res) => {
    try {
        const skillLevel = req.query.skill_level;
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        let filter = {
            date_time: { $gte: startDate, $lte: endDate},
        }
        if (skillLevel) {
            filter.skill_level = skillLevel;
        }
        
        const games = await Game.find(filter).sort({ date_time: 1});

        if (!games.length) {
            return res.status(404).json({ message: "No games found in the next 7 days" });
        }

        res.status(200).json({
            count: games.length,
            games
        })
        
    } catch(err) {
        console.log(err)
        res.send(500).json({ message: "Something went wrong"});
    }
})

router.post('/game', authRequired, requireRole('host'), async (req, res) => {
    try {
        const hostId = req.user.id;

        const game = await Game.create({
            title: req.body.title,
            description: req.body.description,
            host_id: hostId,
            location: {
                address: req.body.location.address.trim(),
                lat: req.body.location.lat,
                lng: req.body.location.lng,
            },
            date_time: req.body.date_time,
            skill_level: req.body.skill_level || 'beginner',
            max_players: req.body.max_players,
            participants: [hostId] // host is listed as a participant by default
        });

        // return minimal + useful data
        return res.status(201).json({
            game: {
                id: game._id,
                title: game.title,
                description: game.description,
                host_id: game.host_id,
                location: game.location,
                date_time: game.date_time,
                skill_level: game.skill_level,
                max_players: game.max_players,
                participants: game.participants,
                created_at: game.created_at
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to create game' });
    }
})

module.exports = router;