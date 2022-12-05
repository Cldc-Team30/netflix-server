const mongoose = require('mongoose');
const express = require('express');
const url = 'mongodb+srv://admin-nandika:test123@netflix-cluster.j0wiwja.mongodb.net/netflixDB';
// const url = 'mongodb://localhost:27017/netflixCldcDB'
const app = express();
mongoose.connect(url);

const netflixSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    videoName: {
        type: String,
        required: true,
        minlength: 2,
        unique: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    description: {
        type: String,
        required: true,
        minlength: 2
    },
    videoLink: {
        type: String,
        required: true,
    },
    genre: {
        type: String,
        required: true,
        enum: ['Educational', 'Drama'],
    }
});

const userSchema = new mongoose.Schema({
    userId: {},
    minsEduStreamed: {},
    minsDramaStreamed: {},
    payment: {}
})

const Video = mongoose.model("Video", netflixSchema);
const User = mongoose.model("User", userSchema);

// Video.insertMany([
//     {
//         id: 1,
//         videoName: "WWII in Color",
//         rating: 9,
//         description: "From the attack on Pearl Harbor to D-Day, the most pivotal events of World War II come to life in this vivid docuseries featuring colorized footage.",
//         videoLink: "https://www.youtube.com/",
//         genre: "Educational"
//     },
//     {
//         id: 2,
//         videoName: "Inception",
//         rating: 8,
//         description: "A troubled thief who extracts secrets from people's dreams takes one last job: leading a dangerous mission to plant an idea in a target's subconscious.",
//         videoLink: "https://www.youtube.com/",
//         genre: "Drama"
//     },
//     {
//         id: 3,
//         videoName: "Our Planet",
//         rating: 9.2,
//         description: "Experience our planet's natural beauty and examine how climate change impacts all living creatures in this ambitious documentary of spectacular scope.",
//         videoLink: "https://www.youtube.com/",
//         genre: "Educational"
//     },
// ]).then(function () {
//     console.log("Data inserted")
// }).catch(function (error) {
//     console.log(error)
// });

// /**
//  * Endpoint to return the list of all the videos.
//  */
app.get("/videos", (req, res) => {
    Video.find({} , (err, foundVideos)=>{
        if(err){res.send(err);}
        else{
          res.send(foundVideos);
        }
      })
})

/**
 * Endpoint to return information about the video with id:{id}
 */
app.get("/videos/:id", (req, res) => {

    let requestVideoId = req.params.id;
    Video.findOne({id:requestVideoId}, (err, foundVideo)=>{
        if(err){
          res.send(err);
        }
        else{
          if(foundVideo){
            res.send(foundVideo);
          }
          else{
            res.send("No video was found");
          }
        }
      })
})

/**
 * Endpoint to return information about the video with id:{id}
 */
app.get("/payment", (req, res) => {

})

app.patch("/updateMinsEduStreamed", (req, res) => {

})

app.patch("/updateMinsDramaStreamed", (req, res) => {

})

app.post("/addUser", (req, res) => {

})

app.listen(8000,()=>{
    console.log("Server started on port 8000");
  })
