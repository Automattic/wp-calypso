
/**
 * WPCOM module
 */

var WPCOM = require('../');
var Site = require('../lib/site');
var Post = require('../lib/post');
var util = require('./util');
var assert = require('assert');

/**
 * Testing data
 */

var test = require('./data');

/**
 * WPCOM instance
 */

describe('WPCOM#Site#Post', function(){
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
    var blog = WPCOM(test.site.private.token).site(test.site.private.id);

    // clean new_post post
    blog.deletePost(new_post.ID, function(err, post) {
      if (err) throw err;

      // clean post_added post
      blog.deletePost(post_added.ID, function(err, post) {
        if (err) throw err;
        done();
      });
    });
  });

  describe('sync', function(){

    it('should create an `Post` instance from `Site`', function(){
      var post = WPCOM().site().post();

      assert.ok(post instanceof Post, 'post is not instance of Post');
    });

    it('should set post `id`', function(){
      var post = WPCOM().site().post();
      post.id(new_post.ID);

      assert.equal(new_post.ID, post._id);
    });

    it('should set post `slug`', function(){
      var post = WPCOM().site().post();
      post.slug(new_post.slug);

      assert.equal(new_post.slug, post._slug);
    });

  });

  describe('async', function(){

    describe('get()', function(){

      it('should get added post (by id)', function(done){
        var site = util.private_site();
        var post = site.post(new_post.ID);

        post.get(function(err, post){
          if (err) throw err;

          assert.equal(new_post.ID, post.ID);
          assert.equal(new_post.site_ID, post.site_ID);
          done();
        });
      });

      it('should get passing a query object', function(done){
        var site = util.private_site();
        var post = site.post(new_post.ID);

        post.get({ content: 'edit' }, function(err, post){
          if (err) throw err;

          assert.equal(new_post.ID, post.ID);
          assert.equal(new_post.site_ID, post.site_ID);
          done();
        });
      });

      it('should get added post (by slug)', function(done){
        var site = util.private_site();
        var post = site.post({ slug: new_post.slug });

        post.get(function(err, post){
          if (err) throw err;

          assert.equal(new_post.ID, post.ID);
          assert.equal(new_post.site_ID, post.site_ID);
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
          assert.ok(data);
          assert.ok(data instanceof Object, 'data is not an object');
          assert.equal(test.site.private.id, data.site_ID);

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

          assert.ok(data);
          assert.equal(edited_title, data.title);

          done();
        });
      });

    });

    describe('likesList()', function(){

      it('should get post likes list', function(done){
        var site = util.private_site();
        var post = site.post(new_post.ID);

        post.likesList(function(err, data){
          if (err) throw err;

          assert.ok(data);

          assert.equal('number', typeof data.found);
          assert.equal('boolean', typeof data.i_like);
          assert.equal('object', typeof data.likes);
          assert.ok(data.likes instanceof Array);

          done();
        });

      });

    });

    describe('like.add()', function(){

      it('should add a post like', function(done){
        var site = util.private_site();
        var like = site.post(new_post.ID).like();

        like.add(function(err, data){
          if (err) throw err;

          assert.ok(data);
          assert.ok(data.success);
          assert.ok(data.i_like);
          assert.equal(1, data.like_count);

          done();
        });

      });

    });

    describe('like.mine()', function(){

      it('should get the post like status of mine', function(done){
        util.private_site()
        .post(new_post.ID)
        .like()
        .mine(function(err, data){
          if (err) throw err;

          assert.ok(data);
          assert.equal(1, data.like_count);
          assert.ok(data.i_like);

          done();
        });
      });

    });

    describe('like.delete()', function(){

      it('should remove your like from the post', function(done){
        util.private_site()
        .post(new_post.ID)
        .like()
        .del(function(err, data){
          if (err) throw err;

          assert.ok(data);
          assert.ok(data.success);
          assert.equal(0, data.like_count);
          assert.ok(!(data.i_like));

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

          assert.ok(data);
          assert.equal(new_post.ID, data.ID);

          done();
        });
      });

    });

  });

});
