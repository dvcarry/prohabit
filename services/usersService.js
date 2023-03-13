const pool = require('../config/bd');

const getUserName = async user_id => {
    const { rows: users } = await pool.query("SELECT name FROM users WHERE id = $1", [user_id]);
    return users[0].name;
};

module.exports = {
    getUserName
}