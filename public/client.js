var socket = io();
var pollId = window.location.pathname.split('/')[2];
var buttons = document.querySelectorAll('#choices button')

var yourVote = document.getElementById('your-vote');
var postVoteMessage = document.getElementById('post-vote-message');
var votesCast = 0;

for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function() {
    if (votesCast >= 1){
      postVoteMessage.innerText = "You cannot vote twice.";
    } else {
      socket.send('voteCast', { vote: this.innerText, id: pollId });
      votesCast ++;
    };
  });
}

socket.on('voteCount', function (votes) {
  for(var key in votes){
    document.getElementById(key.toUpperCase() + '-votes').innerText = votes[key];
  };
});
