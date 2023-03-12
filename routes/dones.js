const express = require("express");
const router = express.Router();
const pool = require('../config/bd');
const { getTeamId, getUsersByTeam, addPost, getUsersDoneToday, getPosts, getHabitByTeam, getMyPoints, getTeamPoints, calcUsersInTeamCount, getMyDones, updateLastLogin } = require("../services/services");
const doneService = require("../services/doneService");
const auth = require('../middlewares/auth');
const { MESSAGE_ALL_TEAM_DONE } = require("../config/constants");

const MY_NAME = 'Я'

router.get("/", auth, async (req, res) => {
    const user_id = req.user_id;

    try {
        const team_id = await getTeamId(user_id);
        const allUsers = await getUsersByTeam(team_id);
        const myName = allUsers.find(user => user.id === user_id).name;
        const allUsersWithMy = allUsers.map(user => user.id === user_id ? ({ ...user, name: MY_NAME }) : user)
        const doneUsers = await getUsersDoneToday(team_id);
        const users = allUsersWithMy.map(user => ({ ...user, done: doneUsers.includes(user.id) })).sort((a) => a.done ? -1 : 1);;
        const myDone = doneUsers.includes(user_id);
        const posts = await getPosts(team_id);
        const habit = await getHabitByTeam(team_id);
        const myPoints = await getMyPoints(user_id);
        const teamPoints = await getTeamPoints(team_id);
        await updateLastLogin(user_id);
        res.status(200).send({ users, myDone, posts, habit, myPoints, teamPoints, myName });
    } catch (error) {
        console.log(error)
        res
            .status(error.status || 500)
            .send({ status: "FAILED", data: { error: error.message || error } });
    }
});



router.post("/", auth, async (req, res) => {

    const user_id = req.user_id;

    try {        
        const team_id = await getTeamId(user_id);
        await doneService.addMyDone(user_id, team_id)
        // await pool.query("INSERT INTO dones (user_id, team_id, create_date) VALUES ($1, $2, current_timestamp)", [user_id, team_id]);
        
        let points = 1;
        let post = null;
        const usersInTeamCount = await calcUsersInTeamCount(team_id);
        const usersDoneToday = await getUsersDoneToday(team_id);
        const isAllUsersInTeamDoneToday = +usersInTeamCount === usersDoneToday.length
        if (isAllUsersInTeamDoneToday) {
            post = await addPost(0, team_id, MESSAGE_ALL_TEAM_DONE);
            points = points + +usersInTeamCount;
        };

        await pool.query("UPDATE teams SET points = points + $1 WHERE id = $2", [points, team_id]);
        res.status(201).send({ success: true, data: { points, post } });
    } catch (error) {
        console.log(error)
        res
            .status(error.status || 500)
            .send({ status: "FAILED", data: { error: error.message || error } });
    }
});


module.exports = router;