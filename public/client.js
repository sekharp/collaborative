var socket = io();
var pollId = window.location.pathname.split('/')[2];
var buttons = document.querySelectorAll('#choices button')

var postVoteMessage = document.getElementById('post-vote-message');
var votesCast = 0;

var closingButton = document.getElementById('close-button');
var closedVoteMessage = document.getElementById('closed-vote-message');

var voteResults = document.getElementById('vote-results');
var adminVoteResults = document.getElementById('admin-vote-results');

for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function() {
    if (votesCast >= 1){
      postVoteMessage.innerHTML = "<h4>You cannot vote twice.</h4>";
    } else {
      socket.send('voteCast', { vote: this.innerText, id: pollId });
      votesCast ++;
      postVoteMessage.innerHTML = "<h4>You voted for " + this.innerText + "</h4>"
    };
  });
}

socket.on('voteCount', function (votes) {
  var result = "";
  for (var key in votes) {
    result += "<tr><td>" + key + "</td><td>" + votes[key] + "</td></tr>";
  }
  voteResults.innerHTML = "<tbody>" + result + "</tbody>";
});

if (closingButton) {
  closingButton.addEventListener('click', function() {
    socket.send('endPoll' + pollId, pollId);
  });
}

socket.on('pollOver' + pollId, function() {
  closedVoteMessage.innerText = "The poll has closed!";
});
