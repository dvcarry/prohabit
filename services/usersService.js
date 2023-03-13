const pool = require('../config/bd');

const getUserName = async user_id => {
    const { rows: users } = await pool.query("SELECT name FROM users WHERE id = $1", [user_id]);
    return users[0].name;
};

const getUserInfo = async user_id => {
    const { rows: users } = await pool.query(`
    SELECT 
        users.id,
        users.name,
        users_habits.line,
        users_habits.level
    FROM users 
    LEFT JOIN users_habits ON users.id = users_habits.user_id WHERE users.id = $1
    `, [user_id]);
    return users[0];
};

module.exports = {
    getUserName,
    getUserInfo
}