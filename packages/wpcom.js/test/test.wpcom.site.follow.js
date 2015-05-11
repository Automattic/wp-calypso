
/**
 * WPCOM module
 */

var util = require('./util');
var assert = require('assert');

/**
 * Testing data
 */

var fixture = require('./fixture');

/**
 * site.follow
 */

describe('wpcom.site.follow', function(){
  // Global instances
  var wpcom = util.wpcom();
  var site = wpcom.site(util.site());
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
