function pollWinner(counted_votes) {
  var poll_winner = []
  if (poll['votes']) {
    for (var response in counted_votes)
    poll_winner.push([response, counted_votes[response]])
    poll_winner.sort(function(a, b) {return a[1] - b[1]}).reverse()
    poll_winner = poll_winner[0]
  };
  return poll_winner
}

module.exports = pollWinner;
