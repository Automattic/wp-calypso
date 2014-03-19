
/**
 * WPCONN module
 */

var WPCONN = require('../');
var Site = require('../lib/site');
var Post = require('../lib/post');
var util = require('./util');

/**
 * Testing data
 */

var tdata = require('./data');

/**
 * WPCONN instance
 */

var wpconn = new WPCONN();

/**
 * Create a `Site` instance
 */

describe('post - sync', function(){
  it('should be an instance of `Site`', function(){
    var wpconn = new WPCONN();
    console.log('-> wpconn.site.post -> ', wpconn.site.post);

    wpconn.site.post
      .should.be.an.instanceOf(Post);
  });
});
