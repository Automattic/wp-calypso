
/**
 * WPCOM module
 */

var WPCOM = require('../');
var assert = require('assert');

/**
 * Testing data
 */

var fixture = require('./fixture');

describe('wpcom.site.follow', function(){
  // Global instances
  var wpcom = WPCOM(fixture.site.token);
  var site = wpcom.site(fixture.site.url);
  var follow = site.follow();

  describe('wpcom.site.follow.follow', function(){
    it('should follow site', function(done){
      follow.follow(function(err, data){
        if (err) throw err;

        assert.ok(data);
        assert.equal(true, data.is_following);

        done();
      });
    });
  });

  describe('wpcom.site.follow.unfollow', function(){
    it('should unfollow site', function(done){
      follow.unfollow(function(err, data){
        if (err) throw err;

        assert.ok(data);
        assert.equal(false, data.is_following);

        done();
      });
    });
  });

  describe('wpcom.site.follow.mine', function() {
    it('should get follow status', function(done){
      follow.mine(function(err, data){
        if (err) throw err;

        assert.ok(data);
        assert.equal(false, data.is_following);

        done();
      });
    });
  });

});