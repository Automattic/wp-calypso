
/**
 * Module dependencies
 */

var util = require('./util');
var assert = require('assert');

/**
 * Fixture data
 */

var fixture = require('./fixture');

/**
 * Create a `Site` instance
 */

describe('apiVersion', function() {
  // Global instances
  var wpcom = util.wpcom();
  var site = wpcom.site(util.site());

  it('should request changing api version', function(done) {
    site
    .addMediaUrls({ apiVersion: '1.1' }, fixture.media.urls[1],
    function(err, data){
      if (err) throw err;

      assert.ok(data);

      site
      .mediaList({ apiVersion: '1' }, function(err, data) {
        if (err) throw err;

        site
        .addMediaFiles({ apiVersion: '1.1' }, fixture.media.files[0],
        function(err, data) {
          if (err) throw err;

          assert.ok(data);
          done();
        });
      });
    });
  });

});
