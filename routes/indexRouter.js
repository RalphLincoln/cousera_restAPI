const express = require('express');
const bodyParser = require('body-parser');

const indexRouter = express.Router();

indexRouter.use(bodyParser.json());

indexRouter.route('/')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })

module.exports = indexRouter;