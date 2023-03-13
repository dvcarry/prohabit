const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken')
const pool = require('../config/bd');
const { DEFAULT_AVATAR } = require("../config/constants");


const makeToken = (user_id) => {
    return jwt.sign(
        { user_id },
        process.env.JWT,
        { expiresIn: '24h' }
    )
};

function generatePassword(len) {
    let password = "";
    const symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!№;%:?*()_+=";
    for (var i = 0; i < len; i++) {
        password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    }
    return password;
}


router.post("/registration", async (req, res) => {

    const { email } = req.body;
    const password = generatePassword(8);

    try {
        const { rows: user } = await pool.query("INSERT INTO users (email, password, create_date) VALUES ($1, $2, current_timestamp) RETURNING id", [email, password]);
        const token = makeToken(user[0].id)
        res.status(201).send({ success: true, data: token });
    } catch (error) {
        console.log(error)
    }
});


router.post("/login", async (req, res) => {

    const { email, password } = req.body;

    try {
        const { rows: users } = await pool.query("SELECT id, email, password, name FROM users WHERE email = $1", [email]);
        if (users.length === 0) {
            res.send({ success: false });
        }
        if (users[0].password !== password) {
            res.send({ success: false });
        }
        if (users[0].password === password) {
            const token = makeToken(users[0].id)
            res.status(201).send({ success: true, token });
        }
    } catch (error) {
        console.log(error)
    }
});


module.exports = router;