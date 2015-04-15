
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

    describe('wpcom.site.statsComments', function () {
      it('should request comments data', function (done) {
        site.statsComments(function (err, data) {
          if (err) throw err;

          assert.equal('string', typeof Date(data.day));
          assert.ok(data.authors instanceof Array);
          assert.ok(data.posts instanceof Array);
          assert.equal('number', typeof data.monthly_comments);
          assert.equal('number', typeof data.total_comments);
          assert.equal('string', typeof data.most_active_day);
          assert.equal('string', typeof data.most_active_time);

          done();
        });
      });
    });

    describe('wpcom.site.statsCommentFollowers', function () {
      it('should request comment follower data', function (done) {
        site.statsCommentFollowers(function (err, data) {
          if (err) throw err;

          assert.equal('string', typeof Date(data.day));
          assert.ok(data.posts instanceof Array);
          assert.equal('number', typeof data.page);
          assert.equal('number', typeof data.pages);
          assert.equal('number', typeof data.total);

          done();
        });
      });
    });

    describe('wpcom.site.statsFollowers', function () {
      it('should request follower data', function (done) {
        site.statsFollowers(function (err, data) {
          if (err) throw err;

          assert.equal('string', typeof Date(data.day));
          assert.ok(data.subscribers instanceof Array);
          assert.equal('number', typeof data.page);
          assert.equal('number', typeof data.pages);
          assert.equal('number', typeof data.total);
          assert.equal('number', typeof data.total_email);
          assert.equal('number', typeof data.total_wpcom);

          done();
        });
      });
    });

    describe('wpcom.site.statsPublicize', function () {
      it('should request publicize data', function (done) {
        site.statsPublicize(function (err, data) {
          if (err) throw err;

          assert.equal('string', typeof Date(data.day));
          assert.ok(data.services instanceof Array);

          done();
        });
      });
    });

    describe('wpcom.site.statsStreak', function () {
      it('should request streak data', function (done) {
        site.statsStreak(function (err, data) {
          if (err) throw err;

          assert.equal('string', typeof Date(data.day));
          assert.ok(data.streak instanceof Object);

          done();
        });
      });
    });

    describe('wpcom.site.statsSummary', function () {
      it('should request summary data', function (done) {
        site.statsSummary(function (err, data) {
          if (err) throw err;

          assert.equal('string', typeof Date(data.day));
          assert.equal('string', typeof data.period);
          assert.equal('number', typeof data.likes);
          assert.equal('number', typeof data.views);
          assert.equal('number', typeof data.visitors);
          assert.equal('number', typeof data.comments);
          assert.equal('number', typeof data.followers);
          assert.equal('number', typeof data.reblogs);

          done();
        });
      });
    });

    describe('wpcom.site.statsTags', function () {
      it('should request tag data', function (done) {
        site.statsTags(function (err, data) {
          if (err) throw err;

          assert.equal('string', typeof Date(data.day));
          assert.ok(data.tags instanceof Array);

          done();
        });
      });
    });

    describe('wpcom.site.statsTopAuthors', function () {
      it('should request author data', function (done) {
        site.statsTopAuthors(function (err, data) {
          if (err) throw err;

          assert.equal('string', typeof Date(data.day));
          assert.equal('string', typeof data.period);
          assert.ok(data.days instanceof Object);

          done();
        });
      });
    });

    describe('wpcom.site.statsVideoPlays', function () {
      it('should request video play data', function (done) {
        site.statsVideoPlays(function (err, data) {
          if (err) throw err;

          assert.equal('string', typeof Date(data.day));
          assert.equal('string', typeof data.period);
          assert.ok(data.days instanceof Object);

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
        site.statsReferrers( function (err, data) {
          if (err) throw err;

          assert.equal('string', typeof Date(data.date));
          assert.equal('object', typeof data.days);
          assert.equal('string', typeof data.period);

          done();
        });
      });
    });

    describe('wpcom.site.statsTopPosts', function () {
      it('should request top posts stats', function (done) {
        site.statsTopPosts( function (err, data) {
          if (err) throw err;

          assert.equal('string', typeof Date(data.date));
          assert.equal('object', typeof data.days);
          assert.equal('string', typeof data.period);

          done();
        });
      });
    });

    describe('wpcom.site.statsCountryViews', function () {
      it('should request country views stats', function (done) {
        site.statsCountryViews( function (err, data) {
          if (err) throw err;

          assert.equal('string', typeof Date(data.date));
          assert.equal('object', typeof data.days);
          assert.ok(data['country-info'] instanceof Array);

          done();
        });
      });
    });

    describe('wpcom.site.statsClicks', function () {
      it('should request clicks stats', function (done) {
        site.statsClicks( function (err, data) {
          if (err) throw err;

          assert.equal('string', typeof Date(data.date));
          assert.equal('object', typeof data.days);
          assert.equal('string', typeof data.period);

          done();
        });
      });
    });

    describe('wpcom.site.statsSearchTerms', function () {
      it('should request search terms stats', function (done) {
        site.statsSearchTerms( function (err, data) {
          if (err) throw err;

          assert.equal('string', typeof Date(data.date));
          assert.equal('object', typeof data.days);
          assert.equal('string', typeof data.period);

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

  describe('wpcom.site.statsReferrersSpamNew', function() {
    var d = new Date();
    var domain = ( d.getTime() / 1000 ) + 'wordpress.com';
    it('should mark a domain as spam', function (done) {
      site.statsReferrersSpamNew( domain, function(err, data) {
        if (err) throw err;

        assert.ok(data);
        done();
      });
    });
  });

  describe('wpcom.site.statsReferrersSpamDelete', function() {
    var d = new Date();
    var domain = ( d.getTime() / 1000 ) + 'wordpress.com';
    it('should remove a domain from spam refferer list', function (done) {
      site.statsReferrersSpamDelete( domain, function(err, data) {
        if (err) throw err;

        assert.ok(data);
        done();
      });
    });
  });

  describe('wpcom.site.statsPostViews', function() {
    it('should request post stat details', function (done) {
      site.statsPostViews( testing_post.ID, function(err, data) {
        if (err) throw err;

        assert.ok(data);
        assert.equal('string', typeof Date(data.date));
        assert.equal('number', typeof data.views);
        assert.equal('number', typeof data.highest_month);
        assert.equal('number', typeof data.highest_day_average);
        assert.equal('number', typeof data.highest_week_average);
        assert.ok(data.post instanceof Object);
        assert.ok(data.years instanceof Object);
        assert.ok(data.weeks instanceof Object);
        assert.ok(data.fields instanceof Array);
        assert.ok(data.data instanceof Array);
        assert.ok(data.averages instanceof Object);

        done();
      });
    });
  });

});