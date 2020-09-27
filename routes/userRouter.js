const express = require('express');
const bodyParser = require('body-parser');

const User = require('../models/users');

const userRouter = express.Router();

userRouter.use(bodyParser.json());

// userRouter.route('/')
//     .all((req, res, next) => {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'text/plain');
//         next();
//     })
//     .get((req, res, next) => {
//         res.end('Will send the users to you!');
//     })

userRouter.route('/signup')
    .post((req, res, next) => {
        // FIRST CHECK TO SEE IF THAT USERNAME ALREADY EXISTS
        User.findOne({ username: req.body.username })
            .then(user => {
                if (user !== null) {
                    var err = new Error(`User ${req.body.username} already exists`);
                    err.status = 403;
                    next(err);
                }
                else {
                    return User.create({
                        username: req.body.username,
                        password: req.body.password
                    })
                }
            })
            // THIS IS HANDLING A SENARIO WHERE A USERNAME DOES NOT EXISTS. THE USERNAME WILL BE SAVED TO THE DATABASE
            .then(user => {
                res.status(200).json(user)
            })
            .catch((err) => next(err))
    })

userRouter.route('/login')
    .post((req, res, next) => {
        // THIS IF CHECK TRIGGERS WHEN THERE IS NO EXISTING SESSION
        if (!req.session.user) {
            var authHeader = req.headers.authorization;

            if (!authHeader) {
                var err = new Error("You are not authenticated")

                res.setHeader("WWW-Authenticate", "Basic");
                err.status = 401;
                return next(err);
            }

            var auth = new Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":");

            var username = auth[0];
            var password = auth[1];

            User.findOne({ username: username })
                .then(user => {
                    if (user === null) {
                        var err = new Error(`User ${username} does not exists`);
                        err.status = 403;
                        return next(err);
                    }
                    else if (user.password !== password) {
                        var err = new Error('Your password is incorrect');
                        err.status = 403;
                        return next(err);
                    }
                    else if (user.username === username && user.password === password) {
                        req.session.user = 'authenticated';
                        res.statusCode = 200;
                        res.setHeader("Content-Type", 'text/plain');
                        res.end("You are authenticated");
                    }
                })
                .catch((err) => next(err))
        }
        else {
            res.statusCode = 200;
            res.setHeader("Content-Type", 'text/plain');
            res.end("You are already authenticated");
        }
    })
userRouter.route('/logout')
    .get((req, res) => {
        if (req.session) {
            req.session.destroy();
            res.clearCookie('session-id');
            res.redirect('/');
        }
        else {
            var err = new Error("You are not logged in!!");
            err.statusCode = 403;
            next(err);
        }
    })
module.exports = userRouter;