const assert = require('assert');
const request = require('request');
const app = require('../server');
const fixtures = require('./fixtures');

describe('Server', () => {

  before((done) => {
    this.port = 9876;

    this.server = app.listen(this.port, (err, result) => {
      if (err) { return done(err); }
      done();
    });

    this.request = request.defaults({
      baseUrl: 'http://localhost:9876/'
    });
  });

  after(() => {
    this.server.close();
  });

  it('should exist', () => {
    assert(app);
  });

  describe('GET /', () => {
    it('should return a 200', (done) => {
      this.request.get('/', (error, response) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('should have a body with the name of the application', (done) => {
      var title = app.locals.title;

      this.request.get('/', (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes(title),
               `"${response.body}" does not include "${title}".`);
        done();
      });
    });
  });

  describe('POST /poll', () => {
    beforeEach(() => {
      app.locals.polls = {};
    });


    it('should not return 404', (done) => {
      this.request.post('/poll', (error, response) => {
        if (error) { done(error); }
        assert.notEqual(response.statusCode, 404);
        done();
      });
    });

    it('should receive and store data', (done) => {
      var payload = { poll: fixtures.validPoll };

      this.request.post('/poll', { form: payload }, (error, response) => {
        if (error) { done(error); }

        var pollCount = Object.keys(app.locals.polls).length;

        assert.equal(pollCount, 1, `Expected 1 poll, found ${pollCount}`);

        done();
      });
    });

    it('should redirect the poll creating admin to their poll dashboard', (done) => {
      var payload = { poll: fixtures.validPoll };

      this.request.post('/poll', { form: payload }, (error, response) => {
        if (error) { done(error); }
        var newPollId = Object.keys(app.locals.polls)[0];
        assert.equal(response.headers.location, '/poll/' + newPollId + '/asdf');
        done();
      });
    });
  });

  describe('GET /polls/:id/:adminId', () => {
    beforeEach(function() {
      app.locals.polls.testPoll = fixtures.validPoll;
    });

    it('should not return a 404', (done) => {
      this.request.get('/poll/testPoll/adminId', (error, response) => {
        if (error) { done(error); }
        assert.notEqual(response.statusCode, 404);
        done();
      });
    });
  });

  describe('GET /polls/:id', () => {
    beforeEach(function() {
      app.locals.polls.testPoll = fixtures.validPoll;
    });

    it('should not return a 404', (done) => {
      this.request.get('/poll/testPoll', (error, response) => {
        if (error) { done(error); }
        assert.notEqual(response.statusCode, 404);
        done();
      });
    });

    it('should return a page that has the title of the poll', (done) => {
      var poll = app.locals.polls.testPoll;

      this.request.get('/poll/testPoll', (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes(poll.question),
          `"${response.body}" does not include "${poll.question}"`);
        done();
      });
    });

    it('should return a page that has the poll responsess', (done) => {
      var poll = app.locals.polls.testPoll;

      this.request.get('/poll/testPoll', (error, response) => {
        if(error) { done(error); }
        assert(response.body.includes(poll.responses[0]),
               `"${response.body}" does not include "${poll.responses.first}".`);
        done();
      });
    });


    it('should show closed message if poll is closed', (done) => {
      var poll = app.locals.polls.testPoll;
      poll['status'] = 'closed';

      this.request.get('/poll/testPoll', (error, response) => {
        if(error) { done(error); }
        assert(response.body.includes("This Poll Is Closed!"));
        done();
      });
    });
  });
});
