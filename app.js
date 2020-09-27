const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const fileStore = require('session-file-store')(session);

// ROUTES
const indexRouter = require('./routes/indexRouter');
const usersRouter = require('./routes/userRouter');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');


// CONNECTING TO MONGODB
const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true });

connect.then((db) => {
  console.log("Connected correctly to server");
}, (err) => { console.log(err); });



const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser("12345-67890-09876-54321"));
app.use(session({
  name: 'session-id',
  secret: "12345-67890-09876-54321",
  saveUninitialized: false,
  resave: false,
  store: fileStore()
}));


// THIS END POINTS WILL OCCUR BEFORE THE AUTHENTICATION
app.use('/', indexRouter);
app.use('/users', usersRouter);

const auth = (req, res, next) => {
  console.log(req.session);

  if (!req.session.user) {
    var err = new Error("You are not authenticated")
    err.status = 401;
    return next(err);
  }
  else {
    if (req.session.user === "authenticated") {
      next();
    }
    else {
      var err = new Error("You are not authenticated")
      err.status = 403;
      return next(err);
    }
  }

}


app.use(express.static(path.join(__dirname, 'public')));

app.use(auth);

// THIS PART CAN ONLY BE ACCESSED AFTER THE AUTHENTICATION
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
