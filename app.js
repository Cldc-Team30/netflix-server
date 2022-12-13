const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const express = require('express');
const url = 'mongodb+srv://admin-nandika:test123@netflix-cluster.j0wiwja.mongodb.net/netflixDB';
// const url = 'mongodb://localhost:27017/netflixCldcDB'
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json())
mongoose.connect(url);
const { expressjwt: jwt } = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');
const cors = require('cors');
const { type } = require('os');
const corsOptions = {
    origin: '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200
}
app.use(cors(corsOptions));

const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://dev-w7kjs2xm5elgzkn0.us.auth0.com/.well-known/jwks.json`
    }),
    audience: 'https://dev-w7kjs2xm5elgzkn0.us.auth0.com/api/v2/',
    issuer: [`https://dev-w7kjs2xm5elgzkn0.us.auth0.com/`],
    algorithms: ['RS256']
});
//...

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
    videoImg:{
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true,
        enum: ['Educational', 'Drama'],
    }
});

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    bytesEduStreamed: {
        type: Number,
        required: true,
        min: 0,
    },
    bytesDramaStreamed: {
        type: Number,
        required: true,
        min: 0,
    }
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
//         videoImg: "https://occ-0-2086-2186.1.nflxso.net/dnm/api/v6/6gmvu2hxdfnQ55LZZjyzYR4kzGk/AAAABazfdM_pvsEcT_uNGB6Nw5ibtzDZ3LL6WO4ke8XGIIb2R5xqQaoPXgr8JnJbcUE1XmxQa0VMGYVYil6sliAXmBhJ3EArljuBZ6024GNmFn6DFCa2dltIqtKp_PlErLO75Lbv.jpg?r=aee",
//         genre: "Educational"
//     },
//     {
//         id: 2,
//         videoName: "Inception",
//         rating: 8,
//         description: "A troubled thief who extracts secrets from people's dreams takes one last job: leading a dangerous mission to plant an idea in a target's subconscious.",
//         videoLink: "https://www.youtube.com/",
//         videoImg: 'https://occ-0-2086-2186.1.nflxso.net/dnm/api/v6/6gmvu2hxdfnQ55LZZjyzYR4kzGk/AAAABWhw56NkHgWP2gKN0y5pR-Q0LBcgcfPK1VQPqeuahqiZLe6ZJ6A62Qt_7YdIBD_qpQb-tnID4MeYS2d0110OG0sJJmBme8_rzm4.webp?r=bd6' ,
//         genre: "Drama"
//     },
//     {
//         id: 3,
//         videoName: "Our Planet",
//         rating: 9.2,
//         description: "Experience our planet's natural beauty and examine how climate change impacts all living creatures in this ambitious documentary of spectacular scope.",
//         videoLink: "https://www.youtube.com/",
//         videoImg: "https://occ-0-2086-2186.1.nflxso.net/dnm/api/v6/6gmvu2hxdfnQ55LZZjyzYR4kzGk/AAAABYXc_Em_eCLOZ1vogowGbqnOp1F4Cpyzgo1tyMDYT_J8ECOEemkdnLETjsL_c2y5nig39opJRPY7f0Uvbrva4ReeS5gs9vXgsbTJ1M8S5H7n5mmuqTDqJSSVEWfZ81CTu2fq.jpg?r=c53",
//         genre: "Educational"
//     },
// ]).then(function () {
//     console.log("Data inserted")
// }).catch(function (error) {
//     console.log(error)
// });

/**
 * Endpoint to return the list of all the videos.
 */
app.get("/videos", checkJwt, (req, res) => {
    // console.log(req.auth.sub) // This is the user id of the user who is signed in on the UI and making this request.
    Video.find({}, (err, foundVideos) => {
        if (err) { res.send(err); }
        else {
            res.send(foundVideos);
        }
    })
})

/**
 * Endpoint to return information about the video with id:{id}
 */
app.get("/videos/:id", (req, res) => {
    let requestVideoId = req.params.id;
    Video.findOne({ id: requestVideoId }, (err, foundVideo) => {
        if (err) {
            res.send(err);
        }
        else {
            if (foundVideo) {
                res.send(foundVideo);
            }
            else {
                res.send("No video was found");
            }
        }
    })
})

/**
 * Endpoint to verify if the user exists, if not, adding the new user in the database.
 */
app.post("/verify", checkJwt, (req, res) => {
    // console.log(req.body)
    let userId = req.auth.sub;
    User.findOne({ userId: userId }, (err, foundUser) => {
        if (err) {
            console.log(err)
            res.status(403).send(err);
        }
        else {
            if (foundUser) {
                res.sendStatus(200);
            }
            else {
                User.create({
                    userId: userId,
                    bytesEduStreamed: 0,
                    bytesDramaStreamed: 0
                })
                res.sendStatus(200);
            }
        }
    });
})

app.get('/video/:id', checkJwt, (req, res) => {
    const path = `assets/goofy.mp4`;
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    let userId = req.auth.sub;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(path, { start, end });

        //   console.log(end-start)
        User.findOne({ userId: userId }, (err, foundUser) => {
            if (err) {
                res.status(403).send(err);
            }
            else {
                let typeOfVideo;
                Video.findOne({ id: req.params.id }, (err, foundVideo) => {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        if (foundVideo) {
                            typeOfVideo = foundVideo.genre;
                        }
                        else {
                            res.send("No video was found");
                        }
                    }
                })
                if (foundUser) {
                    if (typeOfVideo === "Educational") {
                        User.updateOne({
                            userId: foundUser.userId
                        }, { userEmail: foundUser.userEmail }, { bytesDramaStreamed: foundUser.bytesDramaStreamed }, {
                            bytesEduStreamed: foundUser.bytesEduStreamed + (end - start)
                        });
                    }
                    else {
                        User.updateOne({
                            userId: foundUser.userId
                        }, { userEmail: foundUser.userEmail }, { bytesDramaStreamed: foundUser.bytesDramaStreamed + (end - start) }, {
                            bytesEduStreamed: foundUser.bytesEduStreamed
                        });
                    }

                    res.sendStatus(200);
                }
                else {
                    res.sendStatus(403);
                }
            }
        });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(path).pipe(res);
    }
});

app.listen(process.env.PORT || 8000, () => {
    if (process.env.PORT != null) {
        console.log("Server started on port " + process.env.PORT);
    }
    else {
        console.log("Server started on port 8000");
    }
})
