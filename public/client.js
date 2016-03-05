var socket = io();
var pollId = window.location.pathname.split('/')[2];
var buttons = document.querySelectorAll('#choices button')

var yourVote = document.getElementById('your-vote');

for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function() {
    socket.send('voteCast', { vote: this.innerText, id: pollId });
  })
}

socket.on('voteCount', function (votes) {
  for(var key in votes){
    document.getElementById(key.toUpperCase() + '-votes').innerText = votes[key];
  };
});
