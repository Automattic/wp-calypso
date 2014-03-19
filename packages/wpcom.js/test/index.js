/**
 * WPCONN module
 */

var WPCONN = require('../');

/**
 * Testing data
 */

var tdata = require('./data');
var util = require('./util');

/**
 * WPCONN object
 */

describe('WPCONN', function(){
  it('should create a WPCONN object', function(){
    var wpconn = new WPCONN();
    wpconn.should.be.instanceof(WPCONN);
  });

  it('should set the token', function(){
    var wpconn = new WPCONN();
    var token = tdata.token;
    wpconn.setToken(token);

    wpconn.opts.token
      .should.be.ok
      .and.be.instanceOf(String)
      .eql(token);
  });
});

/**
 * ME
 */

describe('me', function(){
  it('should require user object', function(done){
    var wpconn = util.wpconn();

    wpconn.me(function(err, me){
      if (err) throw err;

      // testing object
      me
        .should.be.ok
        .and.an.instanceOf(Object);

      // testing user data
      me.ID
        .should.be.an.instanceOf(Number);

      done();
    });
  });
});

/**
 * POSTS LIST
 */

describe('posts', function(){
  it('should request posts list', function(done){
    var wpconn = util.wpconn();

    wpconn.me(function(err, me){
      if (err) throw err;

      // testing user token site id
      var token_site = me.token_site_id;

      // `me` object data testing
      token_site.should.be.an.instanceOf(Number);

      wpconn.posts(token_site, function(err, list){
        if (err) throw err;

        // list object data testing
        list
          .should.be.an.instanceOf(Object);

        // `posts list` object data testing
        list.found
          .should.be.an.instanceOf(Number);

        list.posts
          .should.be.an.instanceOf(Array);

        done();
      });
    });
  });
});
