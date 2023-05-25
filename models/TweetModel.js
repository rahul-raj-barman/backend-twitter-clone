const mongoose = require('mongoose')

const tweeetSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },

    tweetedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel'
    },

    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'UserModel'
    },

    retweetBy: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'UserModel'
    },

    image: {
        type: String,
        required: false
    },

    replies: {
        type: ['TweetModel']
    },

    isComment: {
        type: Boolean,
        required: false,
        default: false
    }

}, { timestamps: true })

module.exports = mongoose.model("TweetModel", tweeetSchema)