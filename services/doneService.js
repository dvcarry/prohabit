const pool = require('../config/bd');

const addMyDone = async (user_id, team_id) => {
    const { rows: dones } = await pool.query("INSERT INTO dones (user_id, team_id, create_date) VALUES ($1, $2, current_timestamp)", [user_id, team_id]);
    return dones
};

module.exports = {
    addMyDone
}