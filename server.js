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
  res.redirect('/poll/' + id);
});

app.get('/poll/:id', function (req, res){
  var poll = app.locals.polls[req.params.id];
  console.log(poll)
  res.render('poll', { poll: poll });
});

app.get('/polls/:id/:adminId', function(req, res){
  var poll = app.locals.poll[req.params.id];
  res.render('public/poll.ejs', {poll: poll, id: req.params.id, adminID: req.params.adminId});
})

// io.on('connection', function (socket) {
//   console.log('A user has connected.', io.engine.clientsCount);
//
//   io.sockets.emit('userConnection', io.engine.clientsCount);
//
//   socket.emit('statusMessage', 'You have connected.');
//
//   socket.emit('sendPollData', pollData);
//   console.log(pollData);
//
//   socket.on('disconnect', function () {
//     console.log('A user has disconnected.', io.engine.clientsCount);
//   });
// });

module.exports = server;
