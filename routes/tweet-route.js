const express = require('express');
const router = express.Router();
const TweetModel = require('../models/TweetModel');
const protctedRoute = require('../middleware/protectedResource');
const protectedResource = require('../middleware/protectedResource');
const multer = require('multer')



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

router.post('/tweet',protectedResource,upload.single("file"),(req, res) => {
    const {content} = req.body;
    const tweetedBy = req.user._id.toString();
    const tweet = new TweetModel({
        content, tweetedBy
    })
    if(req.file) {
        tweet.image = req.file.path;
    }
    tweet.save()
    .then(() => {
        res.status(201).json({
            message: "Tweeted successfully"
        })
    })
    .catch((err) => {
        res.status(404).json({
            error: err
        })
    })

})




router.post('/tweet/:id/like', protectedResource, (req, res) => {
    const tweetId = req.params.id;
    const userId = req.user._id.toString();
    
    TweetModel.findById(tweetId)
      .then(tweet => {
        if (!tweet) {
          return res.status(404).json({ error: 'Tweet not found' });
        }
  
        if (tweet.likes.includes(userId)) {
          return res.status(400).json({ error: 'Already liked by the user' });
        }
  
        if (tweet.tweetedBy.toString() === userId) {
          return res.status(400).json({ error: 'Cannot like own tweet' });
        }
  
        tweet.likes.push(userId);
        tweet.save()
          .then(() => {
            res.status(200).json({ message: 'Liked tweet successfully' });
          })
          .catch((err) => {
            res.status(500).json({ error: err.message });
          });
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });
  

  router.post('/tweet/:id/dislike', protectedResource, (req, res) => {
    const tweetId = req.params.id;
    const userId = req.user._id.toString();
    
    TweetModel.findById(tweetId)
      .then(tweet => {
        if (!tweet) {
          return res.status(404).json({ error: 'Tweet not found' });
        }
  
        console.log(userId);
        console.log(tweet.likes.includes(userId))
        console.log(tweet);
        if (!tweet.likes.includes(userId)) {
          return res.status(400).json({ error: 'Cannot dislike tweet which is not liked by the user' });
        }
  
        tweet.likes.pull(userId);
        tweet.save()
          .then(() => {
            res.status(200).json({ message: 'Disliked tweet successfully' });
          })
          .catch((err) => {
            res.status(500).json({ error: err.message });
          });
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });
  
  router.post('/tweet/:id/reply', protectedResource,(req, res) => {
    const parentTweetId = req.params.id;
    const repliedBy = req.user._id.toString();
    const content = req.body.content;
    console.log(parentTweetId);
    console.log(repliedBy);
    console.log(content)
    const replyTweet = new TweetModel({
      content: content,
      tweetedBy: repliedBy,
      isComment : req.body.isComment
    });

    replyTweet.save()
      .then((savedReply) => {
        TweetModel.findByIdAndUpdate(
          parentTweetId,
          { $push: { replies: savedReply._id } },
          { new: true }
        )
        .then((updatedParentTweet) => {
          res.status(201).json({ message: 'Replied successfully', reply: savedReply });
        })
        .catch((err) => {
          res.status(500).json({ error: err.message });
        });
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });
  

  router.get('/tweet/:id', protectedResource, (req, res) => {
    const tweetId = req.params.id;
    console.log(tweetId)
  
    TweetModel.findById(tweetId)
      .populate('tweetedBy', '-password')
      .populate({
        path: 'replies',
        populate: {
          path: 'tweetedBy',
          select: '-password'
        }
      })
      .populate({
        path: 'likes',
        select: '-password'
      })
      .exec()
      .then(tweet => {
        if (!tweet) {
          return res.status(404).json({
            error: 'Tweet not found'
          });
        }
  
        res.json(tweet);
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
  });
  
  router.get('/tweet', (req, res) => {
    console.log('api reached')
    TweetModel.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'tweetedBy',
        select: '-password',
      })
      .populate({
        path: 'replies',
        populate: {
          path: 'tweetedBy',
          select: '-password',
        },
      })
      .populate({
        path: 'likes',
        select: '-password',
      })
      .exec()
      .then((tweets) => {
        res.status(200).json(tweets);
      })
      .catch((error) => {
        res.status(500).json({ error: error });
      });
  });

  router.delete('/tweet/:id', protectedResource, (req, res) => {
    const tweetId = req.params.id;
    const userId = req.user._id.toString();
    
    TweetModel.findById(tweetId)
      .then(tweet => {
        if (!tweet) {
          return res.status(404).json({ error: 'Tweet not found' });
        }
        console.log(tweet.tweetedBy.toString())
        console.log(userId)
  
        if (tweet.tweetedBy.toString() !== userId) {
          return res.status(401).json({ error: 'Not authorized to delete this tweet' });
        }
        console.log(tweet)
        tweet.deleteOne(tweet)
          .then(() => {
            res.json({ message: 'Tweet deleted successfully' });
          })
          .catch((err) => {
            res.status(500).json({ error: err });
          });
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });
  

  router.post('/tweet/:id/retweet', protectedResource, (req, res) => {
    const tweetId = req.params.id;
    const userId = req.user._id;
  
    TweetModel.findById(tweetId)
      .populate('retweetBy', 'name')
      .then(tweet => {
        if (!tweet) {
          return res.status(404).json({
            error: 'Tweet not found'
          });
        }
  
        if (tweet.retweetBy.includes(userId)) {
          return res.status(400).json({
            error: 'Tweet already retweeted'
          });
        }
  
        tweet.retweetBy.push(userId);
        return tweet.save();
      })
      .then(() => {
        res.status(201).json({
          message: 'Tweet retweeted successfully'
        });
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({
          error: 'Server error'
        });
      });
  });
  




module.exports = router;