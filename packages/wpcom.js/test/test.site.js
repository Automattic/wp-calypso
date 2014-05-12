

/**
 * WPCOM module
 */

var WPCOM = require('../');
var Site = require('../lib/site');
var util = require('./util');
var assert = require('assert');
var fs = require('fs');

/**
 * Testing data
 */

var test = require('./data');

/**
 * Create a `Site` instance
 */

describe('WPCOM#Site', function(){


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

      assert.ok(site instanceof Site);
      assert.equal(test.site.public.url, site._id);
    });

  });

  describe('async', function(){

    describe('site.get()', function(){
      it('should require site data', function(done){
        var site = util.public_site();

        site.get(function(err, info){
          if (err) throw err;

          assert.equal('number', typeof info.ID);
          assert.equal('string', typeof info.name);

          done();
        });
      });
    });

    describe('site.postsList()', function(){

      it('should request posts list', function(done){
        var site = util.public_site();

        site.postsList(function(err, list){
          if (err) throw err;

          // list object data testing
          assert.equal('object', typeof list);

          // `posts list` object data testing
          assert.equal('number', typeof list.found);

          assert.equal('object', typeof list.posts);
          assert.ok(list.posts instanceof Array);

          done();
        });
      });

      it('should request only one post', function(done){

        var site = util.public_site();

        site.postsList({ number: 1 }, function(err, list){
          if (err) throw err;

          // list object data testing
          assert.equal('object', typeof list);
          assert.equal('number', typeof list.found);
          assert.equal('object', typeof list.posts);
          assert.ok(list.posts instanceof Array);
          assert.ok(list.posts.length <= 1);

          done();
        });

      });

    });

    describe('site.mediaList()', function(){

      it('should request media library list', function(done){
        var site = util.private_site();

        site.mediaList(function(err, list){
          if (err) throw err;

          // list object data testing
          assert.equal('object', typeof list);
          assert.equal('number', typeof list.found);
          assert.equal('object', typeof list.media);
          assert.ok(list.media instanceof Array);

          done();

        });

      });

    });

    describe('site.usersList()', function(){

      it('should request users list', function(done){
        var site = util.private_site();

        site.usersList(function(err, list){
          if (err) throw err;

          assert.equal('number', typeof list.found);
          assert.ok(list.users instanceof Array);
          done();
        });

      });

    });

    describe('site.addPost()', function(){

      it('should create a new blog post', function(done){
        var site = util.private_site();

        var post = site.addPost(test.new_post_data, function(err, data){
          if (err) throw err;

          assert.equal('object', typeof data);
          assert.equal(test.site.private.id, data.site_ID);

          done();
        });

      });

    });

    describe('site.deletePost()', function(){

      it('should delete a blog post', function(done){

        var site = util.private_site();

        var post = site.deletePost(new_post.ID, function(err, data){

          if (err) throw err;

          assert.equal('object', typeof data);
          assert.equal(test.site.private.id, data.site_ID);
          assert.equal(new_post.ID, data.ID);

          done();

        });

      });

    });

    describe('site.addMediaFiles(\'/path/to/file\')', function(){

      it('should create a new media from a file', function(done){
        var site = util.private_site();

        // pass streams
        var files = [];
        //test.new_media_data.files
        for (var i = 0; i < test.new_media_data.files.length; i++) {
          files.push(fs.createReadStream(test.new_media_data.files[i]));
        }

        var media = site.addMediaFiles(files, function(err, data){
          if (err) throw err;

          assert.ok(data);
          assert.ok(data.media instanceof Array);
          assert.equal(test.new_media_data.files.length, data.media.length);
          done();
        });

      });

    });


    describe('site.addMediaUrls([\'url1\', \'url2\'])', function(){

      it('should create a new site media', function(done){
        var site = util.private_site();

        var media = site.addMediaUrls(test.new_media_data.media_urls, function(err, data){
          if (err) throw err;

          assert.ok(data);
          assert.ok(data.media instanceof Array);
          assert.equal(test.new_media_data.media_urls.length, data.media.length);
          done();
        });

      });

    });

  });

});
