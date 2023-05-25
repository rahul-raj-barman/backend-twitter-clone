const express = require('express');
const mongoose = require('mongoose')
// const { MONGODB_URL } = require('./config')
const cors = require('cors')
require('./models/UserModel');
require('./models/TweetModel');
require('./models/CommentModel')
const UserRoute = require('./routes/user_route')
const FileRoute = require('./routes/file-route')
const TweetRoute = require('./routes/tweet-route')
require("dotenv").config(); 


global.__basedir = __dirname;

const PORT = process.env.PORT || 5000;
const app = express();

//middlewares
app.use(express.json())
app.use(cors());
app.use('/images', express.static('images'));
// app.use(cors(corsOptions));



mongoose.connect(process.env.MONGODB_URL);
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected...')
})

mongoose.connection.on('error', (err) => {
    console.log(err)
})

app.get('/', (req, res) => {
    res.send('Hello from the Server...')
})

app.use('/auth', UserRoute)
app.use('/file', FileRoute)
app.use('/api', TweetRoute)

app.listen(PORT, () => {
    console.log('Server is listenning...')
})