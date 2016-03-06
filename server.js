const http = require('http');
const express = require('express');

const app = express();

const port = process.env.PORT || 3000;

const server = http.createServer(app)
                   .listen(port, function () {
                     console.log('Listening on port ' + port + '.');
                   });

const socketIo = require('socket.io');
const io = socketIo(server);

const bodyParser = require('body-parser');
const generateId = require('./lib/generate-id');
const countingVotes = require('./lib/counting-votes');

const moment = require('moment');

app.locals.polls = {};
app.locals.title = "Collaborative";

app.use(bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/', function (req, res){
  res.render('index');
});

app.get('/administer', function (req, res){
  res.render('administer')
});

app.post('/poll', function(req, res) {
  var poll = req.body.poll;
  var id = generateId();
  app.locals.polls[id] = poll;
  poll['adminId'] = req.body.poll.adminId;
  adminId = poll['adminId'];
  poll['votes'] = [];
  poll['status'] = 'open';
  res.redirect('/poll/' + id + '/' + adminId);
});

app.get('/poll/:id', function (req, res){
  var poll = app.locals.polls[req.params.id];
  res.render('poll', { poll: poll });
});

app.get('/poll/:id/:adminId', function(req, res){
  var poll = app.locals.polls[req.params.id];
  res.render('admin-poll', { poll: poll, id: req.params.id });
})

io.on('connection', function (socket) {
  console.log("A user is connected");
  socket.on('message', function (channel, message) {
    if (channel === 'voteCast') {
      var poll = app.locals.polls[message.id];

      if (poll['status'] === 'open') {
        poll['votes'].push(message.vote);
        io.sockets.emit('voteCount', countingVotes(poll));
      }
    }

    if (channel === 'endPoll' + message) { // message is just poll ID here
      var poll = app.locals.polls[message];
      poll['status'] = 'closed';
      console.log(poll);
      io.sockets.emit('pollOver' + message);
    }
  });
});

module.exports = app;
