
/**
 * WPCOM module
 */

var WPCOM = require('../');
var Sites = require('../lib/sites');
var Post = require('../lib/post');
var util = require('./util');

/**
 * Testing data
 */

var test = require('./data');

/**
 * WPCOM instance
 */

describe('WPCOM#Sites#Post', function(){
  // var to store post in `add()` test
  var post_added;

  // Create a new_post before to start the tests
  var new_post;
  before(function(done){
    util.addPost(function(err, post) {
      if (err) throw err;

      new_post = post;
      done();
    });
  });

  after(function(done){
    var blog = WPCOM(test.site.private.token).sites(test.site.private.id);

    // clean new_post post
    blog.deletePost(new_post.ID, function(err, post) {
      if (err) throw err;

      blog.deletePost(new_post.ID, function(err, post) {
        done();
      });
    });

    // clean post_added post
    blog.deletePost(post_added.ID, function(err, post) {
      if (err) throw err;

      blog.deletePost(post_added.ID, function(err, post) {
        done();
      });
    });
  });

  describe('sync', function(){

    it('should create an `Post` instance from `Sites`', function(){
      var post = WPCOM().sites().post();

      post
        .should.be.an.instanceOf(Post);
    });

    it('should set post `id`', function(){
      var post = WPCOM().sites().post();
      post.id(new_post.ID);

      post._id.should.be.eql(new_post.ID);
    });

    it('should set post `slug`', function(){
      var post = WPCOM().sites().post();
      post.slug(new_post.slug);

      post._slug.should.be.eql(new_post.slug);
    });

  });

  describe('async', function(){

    describe('get()', function(){

      it('should get added post (by id)', function(done){
        var site = util.private_site();
        var post = site.post(new_post.ID);

        post.get(function(err, post){
          if (err) throw err;

          post.should.be.eql(new_post);
          done();
        });
      });

      it('should get added post (by slug)', function(done){
        var site = util.private_site();
        var post = site.post({ slug: new_post.slug });

        post.get(function(err, post){
          if (err) throw err;

          post.should.be.eql(new_post);
          done();
        });
      });

    });

    describe('add()', function(){

      it('should add a new post', function(done){
        var site = util.private_site();
        var post = site.post();

        post.add(test.new_post_data, function(err, data){
          if (err) throw err;

          // checking some data date
          data
            .should.be.ok
            .and.be.an.instanceOf(Object);

          data.ID
            .should.be.an.instanceOf(Number);

          data.site_ID
            .should.be.an.instanceOf(Number)
            .and.be.eql(test.site.private.id);

          post_added = data;

          done();
        });
      });

    });

    describe('update()', function(){

      it('should edit the new added post', function(done){
        var site = util.private_site();
        var post = site.post(new_post.ID);

        var edited_title = new_post.title + ' has been changed';

        post.update({ title: edited_title }, function(err, data){
          if (err) throw err;

          data
            .should.be.ok
            .and.be.an.instanceOf(Object);

          data.title
            .should.be.eql(edited_title);

          done();
        });
      });

    });

    describe('delete()', function(){

      it('should delete the new added post', function(done){
        var site = util.private_site();
        var post = site.post(new_post.ID);

        post.delete(function(err, data){
          if (err) throw err;

          data
            .should.be.ok
            .and.be.an.instanceOf(Object);

          data.ID
            .should.be.eql(new_post.ID);

          done();
        });
      });

    });

    describe('likes()', function(){

      it('should get post likes', function(done){
        var site = util.private_site();
        var post = site.post(new_post.ID);

        post.likes(function(err, data){
          if (err) throw err;

          data
            .should.be.ok
            .and.be.an.instanceOf(Object);

          data.found
            .should.be.an.instanceOf(Number);

          data.i_like
            .should.be.an.instanceOf(Boolean);

          data.likes
            .should.be.an.instanceOf(Array);

          done();
        });
      });

    });

  });

});
