
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

describe('wpcom.site.post.reblog', function(){
  // Global instances
  var wpcom = WPCOM(fixture.site.token);
  var site = wpcom.site(fixture.site.url);
  var testing_reblog_post = wpcom
                            .site(fixture.reblog.original_blog)
                            .post(fixture.reblog.original_post);
  var testing_post;

  // Create a testing_post before to start tests
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


  describe('wpcom.site.post.reblog.add', function() {
    it('should reblog the added post', function (done) {
      testing_reblog_post
      .reblog()
      .add({ note: fixture.reblog.note, destination_site_id: site._id }, function (err, data){
        if (err) throw err;

        assert.ok(data);
        assert.ok(data.can_reblog);
        done();
      });
    });
  });

  describe('wpcom.site.post.reblog.to', function(){
    it('should get reblog the added post', function(done){
      testing_reblog_post
      .reblog()
      .to(site._id, fixture.reblog.note + '-to', function (err, data){
        if (err) throw err;

        assert.ok(data);
        assert.ok(data.can_reblog);
        done();
      });
    });
  });

  describe('wpcom.site.post.reblog.mine', function(){
    it('should get the post reblog status of mine', function(done){
      testing_post
      .reblog()
      .mine(function(err, data){
        if (err) throw err;

        assert.ok(data);
        assert.ok(data.can_reblog);
        done();
      });
    });
  });

});