const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
require('dotenv').config();
require('./bot/bot');


const users = require('./routes/users');
const teams = require('./routes/teams');
const habits = require('./routes/habits');
const dones = require('./routes/dones');
const posts = require('./routes/posts');
const auth = require('./routes/auth');



app.use(cors());
app.use(express.json());


app.use("/api/users", users);
app.use("/api/teams", teams);
app.use("/api/habits", habits);
app.use("/api/dones", dones);
app.use("/api/posts", posts);
app.use("/api/auth", auth);


app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT

const start = async () => {
    try {
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()