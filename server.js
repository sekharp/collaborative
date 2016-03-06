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
const pollWinner = require('./lib/poll-winner');

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
  if (poll['minutes']) {
    setRuntime(poll, new Date(), poll['minutes'], id);
  };
  res.redirect('/poll/' + id + '/' + adminId);
});

app.get('/poll/:id', function (req, res){
  var poll = app.locals.polls[req.params.id];
  var counted_votes = countingVotes(poll)
  if (poll['votes']) {
    var poll_winner = pollWinner(counted_votes);
  };
  res.render('poll', { poll: poll, votes: counted_votes, poll_winner: poll_winner });
});

app.get('/poll/:id/:adminId', function(req, res){
  var poll = app.locals.polls[req.params.id];
  var counted_votes = countingVotes(poll)
  if (poll['votes']) {
    var poll_winner = pollWinner(counted_votes);
  };
  res.render('admin-poll', { poll: poll, id: req.params.id, votes: counted_votes, poll_winner: poll_winner });
})

io.on('connection', function (socket) {
  socket.on('message', function (channel, message) {
    if (channel === 'voteCast') {
      var poll = app.locals.polls[message.id];

      if (poll['status'] === 'open') {
        poll['votes'].push(message.vote);
        io.sockets.emit('voteCount', countingVotes(poll));
      }
    };

    if (channel === 'endPoll' + message) {
      var poll = app.locals.polls[message];
      poll['status'] = 'closed';
      io.sockets.emit('pollOver' + message);
    };

    if (channel === 'reopenPoll' + message) {
      var poll = app.locals.polls[message];
      poll['status'] = 'open';
      io.sockets.emit('pollReopened' + message);
    };
  });
});

function setRuntime(poll, dateToday, minutes, id) {
  setTimeout(function() {
    poll['status'] = 'closed';
    io.sockets.emit('pollOver' + id, app.locals.polls[id]);
  }, recordTimeDifference(dateToday, minutes));
};

function recordTimeDifference(date, minutes) {
  var newDate = new Date(date.getTime() + minutes * 60000); // minutes to milliseconds conversion
  return newDate - date;
};

module.exports = app;
