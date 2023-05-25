const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    commentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel"
    },
    comment: {
        type : String,
        required: true
    },
    likes: 
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserModel"
        }]
    ,
    
    replies: []
})

mongoose.model("CommentModel", commentSchema)