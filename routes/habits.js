const express = require("express");
const router = express.Router();

const pool = require('../config/bd');
const { addUserToTeam } = require("../services/services");
const auth = require('../middlewares/auth');


router.get("/", async (req, res) => {

    try {
        const { rows: habits } = await pool.query("SELECT * FROM habits", [])
        res.status(200).send(habits);
    } catch (error) {
        console.log(error)
        res
            .status(error.status || 500)
            .send({ status: "FAILED", data: { error: error.message || error } });
    }
});

router.post("/",
    auth,
    async (req, res) => {

        const { habit_id } = req.body
        const user_id = req.user_id

        try {
            const { rows: user } = await pool.query("INSERT INTO users_habits (user_id, habit_id) VALUES ($1, $2) RETURNING *", [user_id, habit_id]);
            await addUserToTeam(habit_id, user_id);
            res.status(201).send({ success: true, data: user[0] });
        } catch (error) {
            console.log(error)
            res
                .status(error.status || 500)
                .send({ status: "FAILED", data: { error: error.message || error } });
        }
    });

module.exports = router;