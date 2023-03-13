const express = require("express");
const router = express.Router();
const pool = require('../config/bd');
const auth = require('../middlewares/auth');
const { getTeamId } = require("../services/services");
const telegramService = require("../services/telegramService");

const botFunctions = require('../bot/bot');



router.get("/", auth, async (req, res) => {

    const user_id = req.user_id;

    try {
        const team_id = await getTeamId(user_id);
        const { rows: users } = await pool.query(`
            SELECT users.id, name, points, last_done, today_done, last_login, level, line
            FROM users 
            LEFT JOIN (
                SELECT user_id, COUNT(user_id) points, to_char(max(create_date),'DD.MM.YYYY') last_done, 
                CASE WHEN  to_char(max(create_date),'DD-MM-YYYY') = to_char(current_date,'DD-MM-YYYY') THEN 1 ELSE 0 END AS today_done
                FROM dones GROUP BY user_id) points ON users.id = points.user_id
            LEFT JOIN users_habits ON users.id = users_habits.user_id
            WHERE users.team_id = $1
        `, [team_id]);
        const { rows: points } = await pool.query("SELECT * FROM teams WHERE id = $1", [team_id]);
        
        // const telegram_id = await telegramService.getTelegramId(user_id);
        // if (telegram_id) {
        //     await botFunctions.sendMessage(telegram_id, 'Вот оно и пришло!')
        // }

        res.status(200).send({ users, points: points[0].points });
    } catch (error) {
        console.log(error)
        res
            .status(error.status || 500)
            .send({ status: "FAILED", data: { error: error.message || error } });
    }
});

module.exports = router;