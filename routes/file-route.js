const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const multer = require('multer');
const UserModel = mongoose.model('UserModel')


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1
    },
    fileFilter: (req, file, cb) => {
        if(file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        }
        else {
            cb(null, false);
            return res.status(400).json({
                errror: "File types allowed are .jpeg, .jpg, .png"
            })
        }
    }
})

const downloadFile = (req, res) => {
    const filename = req.params.filename;
    const path = __basedir + '/images/';
    console.log("pathh iss")
    console.log(path)
    res.download(path+filename, (err) => {
        if(err) {
            res.status(500).json({
                error : err
            })
        }
    })
}
router.get(`/files/:filename`, downloadFile)

router.post('/:id/uploadProfilePic', upload.single('file'),(req, res) => {
    const user_id = req.params.id;
    profile = req.file.path;
    console.log(user_id)
    UserModel.updateOne({_id:user_id}, {$set : {profilePic: profile}})
    .then((data) => {
        data.profilePic = profile;
        res.status(201).json({message : data})
    })
    .catch((err) => {
        console.log('error')
        res.status(404).json({
            error: err.message
        })
    })
})

module.exports = router;