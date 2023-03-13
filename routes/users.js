const express = require("express");
const router = express.Router();
const pool = require('../config/bd');
const { getDates, calcSeries } = require("../config/utils");
const auth = require('../middlewares/auth');
const { getTeamId, addPost, getMyDones, getMyPoints, getUserName } = require("../services/services");
const usersService = require("../services/usersService");
const doneService = require("../services/doneService");


router.patch("/", auth, async (req, res) => {

    const { name } = req.body;
    const user_id = req.user_id

    try {
        await pool.query("UPDATE users SET name = $1 WHERE id = $2", [name, user_id]);
        const team_id = await getTeamId(user_id);
        await addPost(0, team_id, `Новый участник команды - ${name}`)
        res.status(200).send({ success: true });
    } catch (error) {
        console.log(error)
        res
            .status(error.status || 500)
            .send({ status: "FAILED", data: { error: error.message || error } });
    }
});




router.get("/:user_id", auth, async (req, res) => {

    console.log('params', req.params)

    const user_id = req.params.user_id || req.user_id;
    // const user_id = req.user_id;

    try {
        const dones = await getMyDones(user_id);
        const onlyDates = dones.map(item => item.create_date)
        console.log("🚀 ~ file: users.js:37 ~ router.get ~ onlyDates:", onlyDates)
        const formatedDones = dones.map(item => item.create_date.toLocaleDateString('ru-RU'))
        const firstDoneDate = dones[dones.length - 1].create_date;
        console.log("🚀 ~ file: users.js:40 ~ router.get ~ firstDoneDate:", firstDoneDate)
        const dates = getDates(firstDoneDate, new Date())
        console.log("🚀 ~ file: users.js:41 ~ router.get ~ dates:", dates)
        const datesWithDones = dates.map(date => ({ date, done: formatedDones.includes(date.toLocaleDateString('ru-RU')) }));
        const points = await getMyPoints(user_id);
        const name = await getUserName(user_id);
        const userInfo = await usersService.getUserInfo(user_id);
        const levelInfo = doneService.getPointsForLevels(points);
        const series = calcSeries(onlyDates);
        res.status(200).send({ success: true, data: { ...userInfo, points, levelInfo, name, dates: datesWithDones, series } });
    } catch (error) {
        console.log(error)
        res
            .status(error.status || 500)
            .send({ status: "FAILED", data: { error: error.message || error } });
    }
});



module.exports = router;