const mongoose = require('mongoose');
const express = require('express')
require("dotenv").config();
const UserModel = mongoose.model('UserModel');
const bjs = require('bcryptjs')
// const  JWT_SECRET  = require(process.env.JWT_SECRET)
const router = express.Router();
const protectedRoute = require('../middleware/protectedResource')
const jwt = require('jsonwebtoken')


router.post('/register', (req, res) => {
  const { name, email, username, password } = req.body;

  if (!name || !email || !username || !password) {
    return res.status(400).json({
      error: 'One or more mandatory fields are empty'
    });
  }

  UserModel.findOne({ email: email, userName: username })
    .then((userFound) => {
      if (userFound) {
        return res.status(500).json({
          error: 'User already exists'
        });
      }
      
      bjs.hash(password, 13)
        .then((hashedPassword) => {
          const user = new UserModel({
            name, email, userName: username, password: hashedPassword
          });
          user.save()
            .then((newUser) => {
              return res.status(201).json({
                message: "User signed up successfully"
              });
            })
            .catch((err) => {
              return res.status(404).json({
                error: err
              });
            });
        });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err
      });
    });
});


router.post('/login', (req, res) => {
    const {email, password} = req.body;
    console.log(req.body)
    if(!email || !password) {
        return res.status(400).json({
            error: "One or more mandetory fields are empty"
        })
    }
    UserModel.findOne({email})
    .then((userFound) => {
      if(!userFound) {
        return res.status(404).json({
          error: "User Not Found"
        })
      }
      console.log(userFound)
        bjs.compare(password, userFound.password)
        .then((didMatch) => {
        if(didMatch){
            const jwtToken = jwt.sign({_id: userFound._id}, process.env.JWT_SECRET)
            const userData = {_id:userFound._id ,email:email, username: userFound.userName}

            return res.status(200).json({
                token: jwtToken,
                user: userData
            })
            }
        else {
            return res.status(401).json({
                erro: "Invalid credentials"
            })
        }
        })
        .catch((err) => {
            return res.status(404).json({
              error: err
            })
        })
    })
    .catch((err) => {
      return res.status(404).json({
        error: err
      })
    })
})

router.get('/user/:id', protectedRoute ,(req, res) => {
    const userId = req.params.id;
    UserModel.findById(userId).select('-password').populate('followers', 'followings')
    .then((user) => {
        return res.status(200).json(user)
    })
    .catch((err) => {
        return res.status(404).json({
            error: "User was not found"
        })
    })
})

router.put('/user/:id/follow',protectedRoute ,async (req, res) => {
    const loggedInUserId = req.user._id.toString();
    const userToFollowId = req.params.id; 
    console.log(loggedInUserId);
    console.log(userToFollowId)
  
    try {
      const loggedInUser = await UserModel.findById(loggedInUserId);
      const userToFollow = await UserModel.findById(userToFollowId);
      if (!loggedInUser || !userToFollow) {
        res.status(404).send('User not found');
        return;
      }
      if (!loggedInUser.followings.includes(userToFollowId)) {
        loggedInUser.followings.push(userToFollowId);
        await loggedInUser.save();
      }
      if (!userToFollow.followers.includes(loggedInUserId)) {
        userToFollow.followers.push(loggedInUserId);
        await userToFollow.save();
      }
      res.status(200).send('User followed successfully');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });

  router.put('/user/:id/unfollow', protectedRoute, async (req, res) => {
    const loggedInUserId = req.user._id.toString();
    const userToUnfollowId = req.params.id;

    try {
        const loggedInUser = await UserModel.findById(loggedInUserId);
        const userToUnfollow = await UserModel.findById(userToUnfollowId);

        if (!loggedInUser || !userToUnfollow) {
            res.status(404).send('User not found');
            return;
        }

        if (loggedInUser.followings.includes(userToUnfollowId)) {
            loggedInUser.followings.pull(userToUnfollowId);
            await loggedInUser.save();
        }

        if (userToUnfollow.followers.includes(loggedInUserId)) {
            userToUnfollow.followers.pull(loggedInUserId);
            await userToUnfollow.save();
        }

        res.status(200).send('User unfollowed successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


router.put('/user/:id/unfollow', protectedRoute, (req, res) => {
    const loggedInUserId = req.user._id.toString(); // Replace with actual logged in user ID
    const userToUnfollowId = req.params.id; 
    console.log(loggedInUserId);
    console.log(userToUnfollowId)
  
    UserModel.findById(loggedInUserId, (err, loggedInUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Server error');
        return;
      }
      UserModel.findById(userToUnfollowId, (err, userToUnfollow) => {
        if (err) {
          console.error(err);
          res.status(500).send('Server error');
          return;
        }
        if (!loggedInUser || !userToUnfollow) {
          res.status(404).send('User not found');
          return;
        }
        const loggedInUserIndex = loggedInUser.followings.indexOf(userToUnfollowId);
        if (loggedInUserIndex > -1) {
          loggedInUser.followings.splice(loggedInUserIndex, 1);
          loggedInUser.save((err) => {
            if (err) {
              console.error(err);
              res.status(500).send('Server error');
              return;
            }
          });
        }
        const userToUnfollowIndex = userToUnfollow.followers.indexOf(loggedInUserId);
        if (userToUnfollowIndex > -1) {
          userToUnfollow.followers.splice(userToUnfollowIndex, 1);
          userToUnfollow.save((err) => {
            if (err) {
              console.error(err);
              res.status(500).send('Server error');
              return;
            }
          });
        }
        res.status(200).send('User unfollowed successfully');
      });
    });
  });
  
  router.put('/user/:id',protectedRoute ,(req, res) => {
    const {name, dob, location} = req.body;
    const userId = req.params.id;
    const loggedIn = req.user._id.toString();
    if(loggedIn != userId) {
      return res.status(400),json({
        error: "Bad request"
      })
    }
    if(!name || !dob || !location) {
      return res.status(401).json({
        error: "One or more mandetory fields are empty"
      })
    }
    UserModel.findByIdAndUpdate(userId,{name, dob, location}, {new:true})
    .then((updatedUser) => {
      res.status(201).json({
        message: "User details updated successfully"
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(400).json({
        error: "Server error"
      })
    })
  })


  router.get('/tweets/:userId', (req, res) => {
    const userId = req.params.userId;
  
    TweetModel.find({ tweetedBy: userId })
      .populate('tweetedBy', '_id name')
      .populate('likes', '_id name')
      .populate('retweetBy', '_id name')
      .populate({
        path: 'replies',
        populate: {
          path: 'tweetedBy',
          select: '_id name',
        },
      })
      .then((tweets) => {
        res.status(200).json({
          tweets: tweets,
        });
      })
      .catch((err) => {
        res.status(400).json({
          error: 'Server error',
        });
      });
  });


  
module.exports = router;
