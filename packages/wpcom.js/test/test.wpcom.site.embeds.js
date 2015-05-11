
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

describe('wpcom.site.embeds', function () {
  // Global instances
  var wpcom = util.wpcom();
  var site = wpcom.site(util.site());

  describe('wpcom.site.renderEmbed(\'embed\')', function () {
    it('should render embed', function(done){

      site.renderEmbed(fixture.embed, function (err, data) {
        if (err) throw err;

        assert.equal(data.embed_url, fixture.embed);
        assert.ok(data.result);
        done();
      });
    });
  });

});
