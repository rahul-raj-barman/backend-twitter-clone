const jwt = require('jsonwebtoken')
// const { JWT_SECRET } = require('../config')
const mongoose = require('mongoose')
require("dotenv").config();

const UserModel = mongoose.model('UserModel');


module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    console.log(req.headers)
    if(!authorization) {
        return res.status(401).json({
            error: 'User not logged in'
        })
    }
    const token = authorization.replace("Bearer ", "");
    jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
        if(error) {
            return res.status(404).json({
                error: "User not logged in"
            })
        }
        const {_id} = payload;
        UserModel.findById(_id)
        .then((dbUser) => {
            console.log("doneee" + dbUser._id.toString())
            req.user = dbUser._id;
            next();
        })
    })
}