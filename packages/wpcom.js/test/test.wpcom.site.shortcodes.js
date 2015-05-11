
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
 * WPCOM instance
 */

describe('wpcom.site.shortcodes', function () {
  // Global instances
  var wpcom = util.wpcom();
  var site = wpcom.site(util.site());
  var testing_media;

  // add media testing
  before(function(done){
    site.addMediaFiles(fixture.media.files[0], function(err, data) {
      if (err) throw err;

      testing_media = data ? data.media[0] : {};
      done();
    });
  });

  after(function(done){
    // delete media testing
    site.deleteMedia(testing_media.ID, function(err, data) {
      if (err) throw err;
      
      done();
    });
  });

  describe('wpcom.site.renderShortcode(\'gallery\')', function () {
    it('should render [gallery] shortcode', function(done){

      var shortcode = '[gallery ids="' + testing_media.ID + '"]';
      site.renderShortcode(shortcode, function(err, data){
        if (err) throw err;

        assert.equal(data.shortcode, shortcode);
        assert.ok(data.result);
        assert.ok(data.scripts);
        assert.ok(data.styles);
        done();
      });
    });
  });

});
