const { customAlphabet } = require("nanoid");
const pool = require('../config/bd');

const getTeamId = async user_id => {
    const { rows: teams } = await pool.query("SELECT team_id FROM users WHERE id = $1", [user_id]);
    return teams[0].team_id;
};

const getUsersByTeam = async team_id => {
    const { rows: users } = await pool.query("SELECT id, name, team_id FROM users WHERE team_id = $1", [team_id]);
    return users;
};

const getUsersDoneToday = async team_id => {
    const { rows: dones } = await pool.query("SELECT user_id FROM dones WHERE team_id = $1 AND DATE(create_date) = current_date AND type = $2", [team_id, 'done']);
    const users = dones.map(done => done.user_id)
    return users
};

const getMyDones = async user_id => {
    const { rows: dones } = await pool.query("SELECT * FROM dones WHERE user_Id = $1 ORDER BY create_date DESC", [user_id]);
    return dones
};

const getUserName = async user_id => {
    const { rows: users } = await pool.query("SELECT name FROM users WHERE id = $1", [user_id]);
    return users[0].name;
};

const getHabitByTeam = async team_id => {
    const { rows: habits } = await pool.query("SELECT habits.habit_name FROM teams LEFT JOIN habits ON teams.habit_id = habits.id WHERE teams.id = $1", [team_id]);
    return habits[0].habit_name
};

const getPosts = async team_id => {
    const { rows: posts } = await pool.query("SELECT posts.*, users.name FROM posts LEFT JOIN users ON posts.user_id = users.id WHERE posts.team_id = $1 ORDER BY create_date DESC", [team_id]);
    return posts;
}

const addUserToTeam = async (habit_id, user_id) => {
    console.log("🚀 ~ file: services.js:31 ~ addUserToTeam ~ user_id:", user_id)
    const { rows: teams } = await pool.query(`
        SELECT team_id, count(team_id) FROM 
            (
                SELECT team_id FROM users 
                WHERE team_id IN (SELECT id FROM teams WHERE habit_id = $1)
            ) as teams
        GROUP BY team_id
    `, [habit_id])
    console.log("🚀 ~ file: services.js:39 ~ addUserToTeam ~ teams:", teams)
    const team = teams.find(team => +team.count < 11)
    console.log("🚀 ~ file: services.js:33 ~ addUserToTeam ~ users:", team)
    await pool.query("UPDATE users SET team_id = $1 WHERE id = $2", [team.team_id, user_id])
    return team.team_id;
};

const addPost = async (user_id, team_id, text) => {
    const { rows: posts } = await pool.query("INSERT INTO posts (user_id, team_id, text, create_date) VALUES ($1, $2, $3, current_timestamp) RETURNING *", [user_id, team_id, text])
    return posts[0];
};

const getMyPoints = async user_id => {
    const { rows: points } = await pool.query("SELECT count(user_id) FROM dones WHERE user_id = $1", [user_id]);
    return +points[0].count
};

const getTeamPoints = async team_id => {
    const { rows: teams } = await pool.query("SELECT points FROM teams WHERE id = $1", [team_id]);
    return teams[0].points;
};

const calcUsersInTeamCount = async team_id => {
    const { rows: teams } = await pool.query("SELECT count(*) FROM users WHERE team_id = $1", [team_id]);
    return teams[0].count;
};

const updateLastLogin = async user_id => {
    await pool.query("UPDATE users SET last_login = current_timestamp WHERE id = $1", [user_id]);
};

module.exports = { 
    getTeamId, 
    getUsersByTeam, 
    getUsersDoneToday, 
    getPosts, 
    getHabitByTeam, 
    addUserToTeam, 
    addPost, 
    getMyPoints, 
    getTeamPoints,
    calcUsersInTeamCount,
    getMyDones,
    getUserName,
    updateLastLogin
};