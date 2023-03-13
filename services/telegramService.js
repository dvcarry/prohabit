const pool = require('../config/bd');
const botFunctions = require('../bot/bot');

const addTelegram = async (email, telegram_id) => {
    const { rows: users } = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (users.length === 0) {
        return { status: 'ERROR' }
    } else {
        await pool.query("UPDATE users SET telegram = $1 WHERE email = $2", [telegram_id, email]);
        return { status: 'SUCCESS' }
    };
};

const getTelegramId = async (user_id) => {
    const { rows: users } = await pool.query("SELECT telegram FROM users WHERE id = $1", [user_id]);
    return users[0].telegram;

};

module.exports = {
    addTelegram,
    getTelegramId
}