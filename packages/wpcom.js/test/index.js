
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
  it('should require user object', function(done){
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
 * POSTS LIST
 */

describe('posts', function(){
  it('should request posts list', function(done){
    var wpconn = getInstance();

    wpconn.me(function(err, me){
      if (err) throw err;

      // testing user token site id
      var token_site = me.token_site_id;

      // me object data testing
      token_site.should.be.an.instanceOf(Number);

      wpconn.posts(token_site, function(err, list){
        if (err) throw err;

        // list object data testing
        list.should.be.an.instanceOf(Object);

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

/**
 * ADD POST
 */

describe('post.add', function(){
  it('should add a new post', function(done){
    var wpconn = getInstance();

    wpconn.me(function(err, me){
      if (err) throw err;

      // testing user token site id
      var token_site = me.token_site_id;
      var date = Date.parse(new Date().toString());

      var new_post = {
        "date": date,
        "title": "A new post blog from testing",
        "content": "<div>The content</div>"
      };

      wpconn.post.add(new_post, token_site, function(err, post){
        if (err) throw err;

        // testing object post data
        post.site_ID
          .should.be.an.instanceOf(Number)
          .and.be.eql(token_site);

        // crossing data between user and post
        post.author.ID.should.be.eql(me.ID);

        done();
      });
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
