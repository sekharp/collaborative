module.exports = (poll) => {
  var voteCount = {};
    poll['votes'].forEach(function(vote){
      if(voteCount[vote]){
        voteCount[vote]++;
      } else {
        voteCount[vote] = 1;
      }
    });
    return voteCount;
}
