
/**
 * WPCOM module
 */

var WPCOM = require('../');
var Site = require('../lib/site');
var assert = require('assert');

/**
 * Testing data
 */

var fixture = require('./fixture');

/**
 * WPCOM instance
 */

describe('wpcom.site.post.like', function(){
  // Global instances
  var wpcom = WPCOM(fixture.site.token);
  var site = wpcom.site(fixture.site.url);
  var testing_post;

  // Create a testing_post before to start the tests
  before(function(done){
    site.addPost(fixture.post, function (err, data) {
      if (err) throw err;

      testing_post = site.post(data.ID)
      done();
    });
  });

  after(function(done){
    // delete testing_post post
    testing_post.delete(function(err, post) {
      if (err) throw err;

      done();
    });
  });

  describe('wpcom.site.post.like.add', function(){
    it('should add a post like', function(done){
      testing_post
      .like()
      .add(function(err, data){
        if (err) throw err;

        assert.ok(data);
        assert.ok(data.success);
        assert.ok(data.i_like);
        assert.equal(1, data.like_count);

        done();
      });
    });
  });

  describe('wpcom.site.post.like.mine', function(){
    it('should get the post like status of mine', function(done){
      testing_post
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

  describe('wpcom.site.post.likesList', function(){
    it('should get post likes list', function(done){
      testing_post
      .likesList(function(err, data){
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

  describe('wpcom.site.post.like.delete', function(){
    it('should remove your like from the post', function(done){
      testing_post
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

});