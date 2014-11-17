

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

    describe('site.commentsList()', function(){

      it('should request comments list', function(done){
        var site = util.private_site();

        site.commentsList(function(err, list){
          if (err) throw err;

          // list object data testing
          assert.equal('object', typeof list);
          assert.equal('number', typeof list.found);
          assert.equal('object', typeof list.comments);
          assert.ok(list.comments instanceof Array);

          done();

        });

      });

    });

    describe('site.followsList()', function(){

      it('should request follows list', function(done){
        var site = util.private_site();

        site.followsList(function(err, list){
          if (err) throw err;

          // list object data testing
          assert.equal('object', typeof list);
          assert.equal('number', typeof list.found);
          assert.equal('object', typeof list.users);
          assert.ok(list.users instanceof Array);

          done();

        });

      });

    });

    describe('site.categoriesList()', function(){

      it('should request categories list', function(done){
        var site = util.private_site();

        site.categoriesList(function(err, list){
          if (err) throw err;

          // list object data testing
          assert.equal('object', typeof list);
          assert.equal('string', typeof list.found);
          assert.equal('object', typeof list.categories);
          assert.ok(list.categories instanceof Array);

          done();

        });

      });

    });

    describe('site.tagsList()', function(){

      it('should request tags list', function(done){
        var site = util.private_site();

        site.tagsList(function(err, list){
          if (err) throw err;

          // list object data testing
          assert.equal('object', typeof list);
          assert.equal('string', typeof list.found);
          assert.equal('object', typeof list.tags);
          assert.ok(list.tags instanceof Array);

          done();

        });

      });

    });

    describe('site.stats()', function(){

      it('should request stats data', function(done){
        var site = util.private_site();

        site.stats(function(err, data){
          if (err) throw err;

          assert.equal('string', typeof Date(data.day));
          assert.equal('object', typeof data.stats);
          assert.ok(data.stats instanceof Object);

          assert.equal('object', typeof data.visits);
          assert.ok(data.visits instanceof Object);

          done();

        });

      });

    });

    describe('site.statsVisits()', function(){

      it('should request visits stats', function(done){
        var site = util.private_site();

        site.statsVisits(function(err, data){
          if (err) throw err;

          assert.equal('string', typeof Date(data.unit));

          assert.equal('object', typeof data.data);
          assert.ok(data.data instanceof Array);

          assert.equal('object', typeof data.fields);
          assert.ok(data.fields instanceof Array);

          done();

        });

      });

    });

    describe('site.statsReferrers()', function(){

      it('should request referrers stats', function(done){
        var site = util.private_site();

        site.statsReferrers(function(err, data){
          if (err) throw err;

          assert.equal('string', typeof Date(data.date));

          assert.equal('number', typeof data.days);
          assert.equal('number', typeof data.total);

          assert.equal('object', typeof data.referrers);
          assert.ok(data.referrers instanceof Array);

          done();

        });

      });

    });

    describe('site.statsTopPosts()', function(){

      it('should request top posts stats', function(done){
        var site = util.private_site();

        site.statsTopPosts(function(err, data){
          if (err) throw err;

          assert.equal('string', typeof Date(data.date));
          assert.equal('object', typeof data['top-posts']);
          assert.ok(data['top-posts'] instanceof Array);

          done();

        });

      });

    });

    describe('site.statsCountryViews()', function(){

      it('should request country views stats', function(done){
        var site = util.private_site();

        site.statsCountryViews(function(err, data){
          if (err) throw err;

          assert.equal('string', typeof Date(data.date));
          assert.equal('object', typeof data['country-views']);
          assert.ok(data['country-views'] instanceof Array);

          done();

        });

      });

    });

    describe('site.statsClicks()', function(){

      it('should request clicks stats', function(done){
        var site = util.private_site();

        site.statsClicks(function(err, data){
          if (err) throw err;

          assert.equal('string', typeof Date(data.date));

          assert.equal('number', typeof data.days);
          assert.equal('number', typeof data.total);

          assert.equal('object', typeof data.clicks);
          assert.ok(data.clicks instanceof Array);

          done();

        });

      });

    });

    describe('site.statsSearchTerms()', function(){

      it('should request search terms stats', function(done){
        var site = util.private_site();

        site.statsSearchTerms(function(err, data){
          if (err) throw err;

          assert.equal('string', typeof Date(data.date));

          assert.equal('number', typeof data.days);

          assert.equal('object', typeof data['search-terms']);
          assert.ok(data['search-terms'] instanceof Array);

          done();

        });

      });

    });

  /*
    describe('site.comment.get()', function(){

      it('should request for a site comment', function(done){
        var site = util.private_site();

        site
        .comment(41)
        .get(function(err, data){
          if (err) throw err;

          assert.equal('number', typeof data.ID);
          assert.equal('object', typeof data.post);
          assert.ok(data.post instanceof Object);

          done();

        });

      });

    });

    describe('site.follower.follow()', function() {
      it('should follow the current site', function(done) {
        var site = util.private_site();

        site
        .follower
        .follow(function(error, data) {
          if (error) throw error;

          assert.equal(1, 1);

          done();
        });
      });
    });
    */

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

    describe('site.addMediaFiles([fs])', function(){

      it('should create a new media from a file', function(done){
        var site = util.private_site();

        // pre-process files array
        var files = util.getFiles();

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
