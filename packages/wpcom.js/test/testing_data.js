
/**
 * Package
 */

var pkg = require('../package.json');

/**
 * Testing data
 */

var tdata = require('./data');

/**
 * Sync tests
 */

describe('package', function(){
  it('version should have x.x.x format', function(){
    pkg.version.should.match(/\d\.\d\.\d/);
  });
});

describe('testing data', function(){
  it('`client id` should be a string of numbers', function(){
    (Number(tdata.client_id)).should.be.a.Number;
  });

  it('`client secret` length and type', function(){
    tdata.client_secret
      .should.be.an.instanceOf(String)
      .and.length(64);
  });

  it('`token` should be a String', function(){
    tdata.token
      .should.be.an.instanceOf(String);
  });

  it('`site` should be defined', function(){
    tdata.site
      .should.be.ok
      .and.an.instanceOf(String);
  });
});
