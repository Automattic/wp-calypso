
/**
 * WPCONN module
 */

var WPCONN = require('../');

/**
 * Package
 */

var pkg = require('../package.json');

/**
 * Testing data
 */

var wpapp = require('./data');

/**
 * WPCONN instance
 */

var wpconn = new WPCONN();

/**
 * Sync tests
 */

describe('version', function(){
  it('should have x.x.x format', function(){
    pkg.version.should.match(/\d\.\d\.\d/);
  });
});

describe('wp app', function(){
  it('`client id` should be a string of numbers', function(){
    (Number(wpapp.client_id)).should.be.a.Number;
  });

  it('`client secret` lenght and type', function(){
    wpapp.client_secret
      .should.be.an.instanceOf(String)
      .and.length(64);
  });

  it('`token` should be an String', function(){
    wpapp.token
      .should.be.an.instanceOf(String);
  });
});

/**
 * WPCONN object
 */

describe('WPCONN object', function(){
  it('should create a WPCONN object', function(){
    var wpconn = new WPCONN();
    wpconn.should.be.instanceof(WPCONN);
  });

  it('should set the token', function(){
    var wpconn = new WPCONN();
    var token = wpapp.token;
    wpconn.setToken(token);

    wpconn.token
      .should.be.ok
      .and.be.instanceOf(String)
      .eql(token);
  });
});

/**
 * ME
 */

describe('me', function(){
  it('should get user object', function(done){
    var wpconn = getInstance();

    wpconn.me(function(err, me){
      if (err) throw err;

      // testing object
      me.should.be.ok
      .and.an.instanceOf(Object);

      // testing user data
      me.ID
        .should.be.an.instanceOf(Number);

      done();
    });
  });
});

/**
 * Testing useful function
 */

/**
 * Return a WPCONN instance
 */

function getInstance(){
  var wpconn = new WPCONN();
  var token = wpapp.token;
  wpconn.setToken(token);

  return wpconn;
}
