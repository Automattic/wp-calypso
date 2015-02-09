
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
 * WPCOM instance
 */

describe('wpcom.site.embeds', function () {
  // Global instances
  var wpcom = WPCOM(fixture.site.token);
  var site = wpcom.site(fixture.site.url);

  describe('wpcom.site.renderEmbed(\'embed\')', function () {
    it('should render embed', function(done){

      var url = encodeURIComponent(fixture.embed);

      site.renderEmbed(url, function(err, data){
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