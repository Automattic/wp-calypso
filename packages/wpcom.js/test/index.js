
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
