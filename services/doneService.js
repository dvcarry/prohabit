const pool = require('../config/bd');
const { POINTS_FOR_NEXT_LEVEL, POINTS_INLINE_FOR_REWARD } = require('../config/constants');

const addMyDone = async (user_id, team_id, type) => {
    const { rows: dones } = await pool.query("INSERT INTO dones (user_id, team_id, create_date, type) VALUES ($1, $2, current_timestamp, $3)", [user_id, team_id, type]);
    return dones
};

const getMyDones = async user_id => {
    const { rows: dones } = await pool.query("SELECT * FROM dones WHERE user_Id = $1 ORDER BY create_date DESC", [user_id]);
    return dones
};

const getMyPoints = async user_id => {
    const { rows: points } = await pool.query("SELECT count(user_id) FROM dones WHERE user_id = $1", [user_id]);
    return +points[0].count
};

const checkIfUserGoNextLevel = (points) => {
    return POINTS_FOR_NEXT_LEVEL.includes(points);
};

const updateUserLevel = async user_id => {
    await pool.query("UPDATE users_habits SET level = level + 1 WHERE user_id = $1", [user_id]);
};

const addLineToUser = async user_id => {
    const { rows: response } = await pool.query("UPDATE users_habits SET line = line + 1 WHERE user_id = $1 RETURNING line", [user_id]);
    console.log("🚀 ~ file: doneService.js:29 ~ addLineToUser ~ response:", response)
    return response[0].line;
};

const reloadLineToUser = async user_id => {
    const { rows: response } = await pool.query("UPDATE users_habits SET line = 0 WHERE user_id = $1 RETURNING line", [user_id]);
    console.log("🚀 ~ file: doneService.js:35 ~ reloadLineToUser ~ response:", response)
    return response[0].line;
};

const checkIsCurDoneInLine = async (user_id, team_id) => {
    const { rows: response } = await pool.query(`SELECT EXISTS(SELECT id FROM dones 
            WHERE user_id = $1
            AND team_id = $2 
            AND to_char((current_date + interval '-1' day), 'DD-MM-YYYY') = to_char(create_date, 'DD-MM-YYYY'))
        `, [user_id, team_id]);
    console.log("🚀 ~ file: doneService.js:45 ~ checkIsCurDoneInLine ~ response:", response)
    return response[0].exists
};

const checkIsCurDoneShouldBeReward = donesInline => {
    return donesInline % POINTS_INLINE_FOR_REWARD === 0 ? true : false;
};

module.exports = {
    addMyDone,
    getMyDones,
    getMyPoints,
    checkIfUserGoNextLevel,
    updateUserLevel,
    checkIsCurDoneInLine,
    checkIsCurDoneShouldBeReward,
    addLineToUser,
    reloadLineToUser
}