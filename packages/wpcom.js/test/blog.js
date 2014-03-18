

/**
 * WPCONN module
 */

var WPCONN = require('../');
var Blog = require('../lib/blog');

/**
 * Testing data
 */

var wpapp = require('./data');

/**
 * WPCONN instance
 */

var wpconn = new WPCONN();

/**
 * Create a `Blog` instance
 */

describe('Blog constructor', function(){
  it('should be an instance of `Blog`', function(){
    var wpconn = new WPCONN();
    var blog = wpconn.blog(wpapp.token);

    blog.should.be.an.instanceOf(Blog);
  });
});
