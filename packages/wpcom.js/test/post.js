
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

describe('post', function(){

  // Create a new_post before to start the tests
  var new_post;
  before(function(done){
    var wpconn = util.private_site();
    wpconn.site.post.add(tdata.new_post_data, function(err, post){
      if (err) done(err);

      new_post = post;
      done();
    });
  });

  describe('sync', function(){

    it('should be an instance of `Site`', function(){
      var wpconn = WPCONN();
      wpconn.site.post
        .should.be.an.instanceOf(Post);
    });

  });

  describe('async', function(){
    describe('get', function(){
      it('should get the recently added post', function(done){
        var wpconn = util.private_site();
        wpconn.site.post.get(new_post.ID, function(err, post){
          if (err) throw err;

          post.should.be.eql(new_post);
          done();
        });
      });
    });

    describe('add', function(){
      it('should add a new post', function(done){
        var wpconn = util.private_site();
        wpconn.site.post.add(tdata.new_post_data, function(err, post){
          if (err) throw err;

          // checking some post date
          post
            .should.be.ok
            .and.be.an.instanceOf(Object);

          post.ID
            .should.be.an.instanceOf(Number);

          post.site_ID
            .should.be.an.instanceOf(Number)
            .and.be.eql(tdata.private_site_id);

          done();
        });
      });

    });

  });

});
