const express = require("express");
const router = express.Router();
const pool = require('../config/bd');
const auth = require('../middlewares/auth');
const { getTeamId } = require("../services/services");



router.get("/", auth, async (req, res) => {

    const user_id = req.user_id;

    try {
        const team_id = await getTeamId(user_id);
        const { rows: users } = await pool.query(`
            SELECT id, name, points, last_done, today_done, last_login
            FROM users 
            LEFT JOIN (
                SELECT user_id, COUNT(user_id) points, to_char(max(create_date),'DD.MM.YYYY') last_done, 
                CASE WHEN  to_char(max(create_date),'DD-MM-YYYY') = to_char(current_date,'DD-MM-YYYY') THEN 1 ELSE 0 END AS today_done
                FROM dones GROUP BY user_id) points ON users.id = points.user_id
            WHERE users.team_id = $1
        `, [team_id]);
        const { rows: points } = await pool.query("SELECT * FROM teams WHERE id = $1", [team_id]);
        res.status(200).send({ users, points: points[0].points });
    } catch (error) {
        console.log(error)
        res
            .status(error.status || 500)
            .send({ status: "FAILED", data: { error: error.message || error } });
    }
});

module.exports = router;