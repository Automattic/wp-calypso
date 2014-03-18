

/**
 * WPCONN module
 */

var WPCONN = require('../');
var Site = require('../lib/site');

/**
 * Testing data
 */

var wpapp = require('./data');

/**
 * WPCONN instance
 */

var wpconn = new WPCONN();

/**
 * Create a `Site` instance
 */

describe('site', function(){
  it('should be an instance of `Site`', function(){
    var wpconn = new WPCONN();

    wpconn.site
      .should.be.an.instanceOf(Site);
  });
});

describe('get site info', function(){
  
});
