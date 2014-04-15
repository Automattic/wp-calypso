

/**
 * WPCOM module
 */

var WPCOM = require('../');
var Sites = require('../lib/sites');
var util = require('./util');

/**
 * Testing data
 */

var test = require('./data');

/**
 * Create a `Sites` instance
 */

describe('WPCOM#Sites', function(){


  // Create a new_post before to start the tests
  var new_post;
  before(function(done){
    util.addPost(function(err, post) {
      if (err) return done(err);

      new_post = post;
      done();
    });
  });

  describe('sync', function(){

    it('should be create a site object instance', function(){
      var site = util.public_site();

      site
        .should.be.an.instanceOf(Sites);

      site._id
        .should.be.eql(test.site.public.url);
    });

  });

  describe('async', function(){

    describe('get()', function(){
      it('should require site data', function(done){
        var site = util.public_site();

        site.get(function(err, info){
          if (err) throw err;

          // check site info
          info.ID
            .should.be.an.instanceOf(Number);

          info.name
            .should.be.an.instanceOf(String);
          done();
        });
      });
    });

    describe('posts()', function(){

      it('should request posts list', function(done){
        var site = util.public_site();

        site.posts(function(err, list){
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

      it('should request only one post', function(done){

        var site = util.public_site();

        site.posts({ number: 1 }, function(err, list){
          if (err) throw err;

          // list object data testing
          list
            .should.be.an.instanceOf(Object);

          // `posts list` object data testing
          list.found
            .should.be.an.instanceOf(Number);

          // get only one post
          list.posts
            .should.be.an.instanceOf(Array)
            .and.length(1);

          done();
        });

      });
    });

    describe('addPost()', function(){

      it('should create a new blog post', function(done){

        var site = util.private_site();

        var post = site.addPost(test.new_post_data, function(err, data){
          if (err) throw err;

          data
            .should.be.an.instanceOf(Object);

          data.site_ID
            .should.be.eql(test.site.private.id);

          done();
        });

      });

    });

    describe('deletePost()', function(){

      it('should delete a blog post', function(done){

        var site = util.private_site();

        var post = site.deletePost(new_post.ID, function(err, data){

          if (err) throw err;

          data
            .should.be.an.instanceOf(Object);

          data.site_ID
            .should.be.eql(test.site.private.id);

          data.ID
            .should.be.eql(new_post.ID);

          done();
        });

      });
    });
  });

});
