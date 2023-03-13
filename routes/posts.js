const express = require("express");
const router = express.Router();
const pool = require('../config/bd');
const { MY_NAME } = require("../config/constants");
const { getTeamId, addPost } = require("../services/services");
const auth = require('../middlewares/auth');



router.post("/", auth, async (req, res) => {

    const { text } = req.body
    const user_id = req.user_id;

    try {
        const team_id = await getTeamId(user_id);
        const post = await addPost(user_id, team_id, text)
        // const { rows: posts } = await pool.query("INSERT INTO posts (user_id, team_id, text, create_date) VALUES ($1, $2, $3, current_timestamp) RETURNING *", [user_id, team_id, text])
        res.status(201).send({ success: true, data: {...post, name: MY_NAME} });
    } catch (error) {
        console.log(error)
        res
            .status(error.status || 500)
            .send({ status: "FAILED", data: { error: error.message || error } });
    }
});


module.exports = router;