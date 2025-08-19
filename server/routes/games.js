const express = require('express');
const mongoose = require('mongoose');

const Game = require('../models/game');
const Participation = require('../models/participation')

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
router.get('/games', authRequired, async (req, res) => {
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
        res.status(500).json({ message: "Something went wrong"});
    }
})

router.post('/games', authRequired, requireRole('host'), async (req, res) => {
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


router.post('/games/:id/join', authRequired, async (req, res) => {
    try {
        const user = req.user;
        const gameId = req.params.id;
        const todayDate = new Date();
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: "The game does not exist"});
        }
        if (game.participants.includes(user.id)) {
            return res.status(400).json({ message: "You are already in the game!"});
        }
        if (game.max_players <= game.participants.length) {
            return res.status(400).json({ message: "Sorry, the game is full"});
        }

        game.participants.push(user.id);
        const participation = await Participation.create({
            user_id: user.id,
            game_id: game._id
        });
        await game.save();
        
        res.status(200).json({
            message: "Joined the game successfully!",
            success: true,
            game,
            participation
        })

    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Failed to join the game"});
    }
})

router.delete('/games/:id/leave', authRequired, async (req, res) => {
    try {
        const current_date = new Date();
        const user = req.user;
        const gameId = req.params.id;

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: "The game does not exist"});
        }

        if (!game.participants.some((id) => id.toString() === user.id)) {
            return res.status(400).json({message: "You are not in the game"});
        }

        if ((game.date_time.getTime() - current_date.getTime() ) / 3600000 <= 2) {
            return res.status(400).json({message: "You cannot leave the game, as the game will start soon"})
        }
        
        const participation = await Participation.findOne({user_id: user.id, game_id: game._id});
        if (participation) {
            await participation.deleteOne();
        }


        game.participants = game.participants.filter((id) => id.toString() !== user.id);
        await game.save();


        return res.status(200).json({
            message: "The user was successfully removed from the game",
            game
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Failed to leave the game" });
    }
})

module.exports = router;