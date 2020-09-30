const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');


const authenticate = require('../authenticate');

const User = require('../models/users');

const userRouter = express.Router();

userRouter.use(bodyParser.json());


userRouter.post('/signup', (req, res, next) => {
    User.register(new User({ username: req.body.username }),
        req.body.password, (err, user) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({ err: err });
            }
            else {
                passport.authenticate('local')(req, res, () => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ success: true, status: 'Registration Successful!' });
                });
            }
        });
});

userRouter.post('/login', passport.authenticate('local'), (req, res) => {

    var token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, token: token, status: 'You are successfully logged in!' });
});


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