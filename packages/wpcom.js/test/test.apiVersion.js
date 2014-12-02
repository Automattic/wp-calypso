
/**
 * Module dependencies
 */

var Site = require('../lib/site');
var util = require('./util');
var assert = require('assert');

/**
 * Testing data
 */

var test = require('./data');

/**
 * Create a `Site` instance
 */

describe('WPCOM#apiVersion', function() {

  describe('async', function() {

    describe('wpcom.apiVersion()', function() {
      it('should request changing api version', function(done) {

        var wpcom = util.wpcom();
        var site = util.private_site();

        site
        .addMediaUrls({ apiVersion: '1.1' }, test.new_media_data.media_urls[1],
        function(err, data){
          if (err) throw err;

          assert.ok(data);

          site
          .mediaList({ apiVersion: '1' }, function(err, data) {
            if (err) throw err;

            site
            .addMediaFiles({ apiVersion: '1.1' }, test.new_media_data.files[0],
            function(err, data) {
              if (err) throw err;

              assert.ok(data);
              done();
            });

          });

        });

      });

    });

  });

});
