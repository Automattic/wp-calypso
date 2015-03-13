
/**
 * WPCOM module
 */

var WPCOM = require('../');
var assert = require('assert');

/**
 * Testing data
 */

var fixture = require('./fixture');

/**
 * Create a `Site` instance
 */

describe('wpcom.site', function () {
  // Global instances
  var wpcom = WPCOM(fixture.site.token);
  var site = wpcom.site(fixture.site.url);
  var testing_post;
  var new_post_ID;
  var site_ID;

  // Create a testing_post before to start tests
  before(function (done) {
    site.addPost(fixture.post, function (err, data_post) {
      if (err) return done(err);

      testing_post = data_post;

      site.get(function (err, data_site) {
        if (err) return done(err);

        site_ID = data_site.ID;

        done();
      })
    });
  });

  // Delete testing post
  after(function (done) {
    site.deletePost(testing_post.ID, function (err, data) {
      if (err) throw err;
      
      done();
    });
  });

  describe('wpcom.site.lists', function () {

    describe('wpcom.site.postsList', function () {
      it('should request posts list', function (done) {
        site.postsList(function (err, list) {
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

      it('should request only one post', function (done) {
        site.postsList({ number: 1 }, function (err, list) {
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

    describe('wpcom.site.mediaList', function () {
      it('should request media library list', function (done) {
        site.mediaList(function (err, list) {
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

    describe('wpcom.site.usersList', function () {
      it('should request users list', function (done) {
        site.usersList(function (err, list) {
          if (err) throw err;

          assert.equal('number', typeof list.found);
          assert.ok(list.users instanceof Array);

          done();
        });
      });
    });

    describe('wpcom.site.commentsList', function () {
      it('should request comments list', function (done) {
        site.commentsList(function (err, list){
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

    describe('wpcom.site.followsList', function () {
      it('should request follows list', function (done) {
        site.followsList(function (err, list) {
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

    describe('wpcom.site.categoriesList', function () {
      it('should request categories list', function (done) {
        site.categoriesList(function (err, list) {
          if (err) throw err;

          // list object data testing
          assert.equal('object', typeof list);
          assert.equal('number', typeof list.found);
          assert.equal('object', typeof list.categories);
          assert.ok(list.categories instanceof Array);

          done();
        });
      });
    });

    describe('wpcom.site.shortcodesList', function () {
      it('should request shortcodes list', function (done) {
        site.shortcodesList(function (err, list) {
          if (err) throw err;

          // list object data testing
          assert.equal('object', typeof list);
          assert.equal('object', typeof list.shortcodes);
          assert.ok(list.shortcodes instanceof Array);

          done();
        });
      });
    });

    describe('wpcom.site.embedsList', function () {
      it('should request embeds list', function (done) {
        site.embedsList(function (err, list) {
          if (err) throw err;

          // list object data testing
          assert.equal('object', typeof list);
          assert.equal('object', typeof list.embeds);
          assert.ok(list.embeds instanceof Array);

          done();
        });
      });
    });

    describe('wpcom.site.tagsList', function () {
      it('should request tags list', function (done) {
        site.tagsList(function (err, list) {
          if (err) throw err;

          // list object data testing
          assert.equal('object', typeof list);
          assert.equal('number', typeof list.found);
          assert.equal('object', typeof list.tags);
          assert.ok(list.tags instanceof Array);

          done();
        });
      });
    });

    describe('wpcom.site.stats', function () {
      it('should request stats data', function (done) {
        site.stats(function (err, data) {
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

    describe('wpcom.site.statsVisits', function () {
      it('should request visits stats', function (done) {
        site.statsVisits(function (err, data) {
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

    describe('wpcom.site.statsReferrers', function () {
      it('should request referrers stats', function (done) {
        site.statsReferrers({ apiVersion: '1' }, function (err, data) {
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

    describe('wpcom.site.statsTopPosts', function () {
      it('should request top posts stats', function (done) {
        site.statsTopPosts({ apiVersion: '1' }, function (err, data) {
          if (err) throw err;

          assert.equal('string', typeof Date(data.date));
          assert.equal('object', typeof data['top-posts']);
          assert.ok(data['top-posts'] instanceof Array);

          done();
        });
      });
    });

    describe('wpcom.site.statsCountryViews', function () {
      it('should request country views stats', function (done) {
        site.statsCountryViews({ apiVersion: '1' }, function (err, data) {
          if (err) throw err;

          assert.equal('string', typeof Date(data.date));
          assert.equal('object', typeof data['country-views']);
          assert.ok(data['country-views'] instanceof Array);

          done();
        });
      });
    });

    describe('wpcom.site.statsClicks', function () {
      it('should request clicks stats', function (done) {
        site.statsClicks({ apiVersion: '1' }, function (err, data) {
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

    describe('wpcom.site.statsSearchTerms', function () {
      it('should request search terms stats', function (done) {
        site.statsSearchTerms({ apiVersion: '1' }, function (err, data) {
          if (err) throw err;

          assert.equal('string', typeof Date(data.date));

          assert.equal('number', typeof data.days);

          assert.equal('object', typeof data['search-terms']);
          assert.ok(data['search-terms'] instanceof Array);

          done();
        });
      });
    });
  });
 
  describe('wpcom.site.get', function () {
    it('should require site data', function (done) {
      site.get(function (err, data) {
        if (err) throw err;

        assert.equal('number', typeof data.ID);
        assert.equal('string', typeof data.name);

        done();
      });
    });
  });

  describe('wpcom.site.addPost', function () {
    it('should create a new blog post', function (done) {
      site.addPost(fixture.post, function (err, data) {
        if (err) throw err;
        
        // store in post ID global var
        new_post_ID = data.ID;

        assert.equal('object', typeof data);
        assert.equal(site_ID, data.site_ID);

        done();
      });
    });
  });

  describe('wpcom.site.deletePost', function () {
    it('should delete post added', function (done) {
      site.deletePost(new_post_ID, function (err, data) {
        if (err) throw err;

        assert.equal('object', typeof data);
        assert.equal(new_post_ID, data.ID);

        done();
      });
    });
  });

  describe('wpcom.site.addMediaFiles', function () {
    it('should create a new media from a file', function (done) {
      site.addMediaFiles(fixture.media.files, function (err, data) {
        if (err) throw err;

        assert.ok(data);
        assert.ok(data.media instanceof Array);
        assert.equal(fixture.media.files.length, data.media.length);
        done();
      });
    });
  });

  describe('wpcom.site.addMediaUrls', function () {
    it('should create a new site media', function (done) {
      media = site.addMediaUrls(fixture.media.urls, function (err, data) {
        if (err) throw err;

        assert.ok(data);
        assert.ok(data.media instanceof Array);
        assert.equal(fixture.media.urls.length, data.media.length);
        done();
      });
    });
  });

});