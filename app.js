var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');


require('./models/Users');
require('./models/UserLog');
require('./config/passport');


mongoose.connect('mongodb://appAdmin:Gokussj6@ds037607.mlab.com:37607/heroku_nqbqpd5t' || 'mongodb://localhost/rockstarImFinal', function(){
  console.log('mongodb connected');
});

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
// require('./models/msg');
var socket_io = require('socket.io')();
var io = socket_io;
app.io = io;

io.sockets.on('connection', function (socket) {

  socket.on('send message', function(data){
    // console.log('sending room post', data.room, 'message contains: ', data.text);
    io.sockets.in(data.room).emit('private', {
      room: data.room,
      text: data.text,
      from: data.from,
      avatar: data.avatar
    });
  });

  socket.on('subscribe', function(room){
    console.log('joining room: ', room);
    socket.join(room);
  });
}); 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
