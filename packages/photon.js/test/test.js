
/**
 * Module dependencies.
 */

var photon = require('../');
var assert = require('assert');
var parseUrl = require('url').parse;

function assertHostedOnPhoton( url ) {
  assert(RegExp('^https://i[0-2].wp.com').test(url));
}

function assertHostedOnPhotonInsecurely( url ) {
  assert(RegExp('^http://i[0-2].wp.com').test(url));
}

function assertPathname ( url, expected ) {
  var parsedUrl = parseUrl(url, true, true);
  assert.strictEqual(parsedUrl.pathname, expected);
}

function assertQuery ( url, expected ) {
  var query = parseUrl(url, true, true).query,
    key;

  assert.deepEqual(query, expected);
}

describe('photon()', function () {

  it('should be a "function"', function () {
    assert.strictEqual(typeof photon, 'function');
  });

  it('should Photon-ify a basic image URL', function () {
    var url = 'http://example.com/image.png';

    assert(RegExp('https://i[0-2].wp.com/example.com/image.png').test(photon(url)));
  });

  it('should Photon-ify a secure image URL', function () {
    var url = 'https://example.com/image.png';
    assert(RegExp('https://i[0-2].wp.com/example.com/image.png\\\?ssl=1').test(photon(url)));
  });

  it('should not Photon-ify an existing Photon URL, even if the host is wrong', function () {
    var photonedUrl = photon('http://www.gravatar.com/avatar/693307b4e0cb9366f34862c9dfacd7fc');
    var alternateUrl = 'https://i1.wp.com/www.gravatar.com/avatar/693307b4e0cb9366f34862c9dfacd7fc';

    assertHostedOnPhoton(photonedUrl);
    assert.notStrictEqual(photonedUrl, alternateUrl);
    assert.strictEqual(photon(alternateUrl), alternateUrl);
  });

  it('should handle photoning a photoned url', function() {
    var url = photon('http://example.com/image.png');
    assert.strictEqual(photon(url), url);
  });

  it('should add width parameters if specified', function() {
    var photonedUrl = photon('http://example.com/image.png', { width: 50 });
    var parsedUrl = parseUrl(photonedUrl, true, true);

    assertQuery(photonedUrl, { 'w':'50' });
  });

  it('should return null for URLs with querystrings from non-photon hosts', function() {
    var url = 'http://example.com/image.png?foo=bar';

    assert.strictEqual(photon(url), null);
  });

  it('should handle protocolless URLs', function() {
    var url = '//example.com/image.png';
    var photonedUrl = photon(url);

    assertHostedOnPhoton( photonedUrl );
    assertPathname(photonedUrl, '/example.com/image.png');
  });

  it('should strip existing size params from photoned URLs', function () {
      var url = 'https://i0.wp.com/www.gravatar.com/avatar/693307b4e0cb9366f34862c9dfacd7fc?resize=120';
      var photonedUrl = photon(url, { width: 150, height: 300 });

      assertHostedOnPhoton(photonedUrl);
      assertPathname(photonedUrl, '/www.gravatar.com/avatar/693307b4e0cb9366f34862c9dfacd7fc');
      assertQuery(photonedUrl, { w: '150', h: '300' });
  });

  it('should allow you to do everything at once', function() {
    var url = 'https://i0.wp.com/example.com/foo.png?w=50&lb=10&unknown=true';
    var photonedUrl = photon(url, {
      width: 10,
      height: 20,
      letterboxing: '120,120',
      removeLetterboxing: true
    });

    assertHostedOnPhoton( photonedUrl );
    assertPathname( photonedUrl, '/example.com/foo.png' );
    assertQuery( photonedUrl, { w: '10', h: '20', 'lb': '120,120', ulb: 'true' });
  });

  it('should allow you to turn off https', function() {
    var photonedUrl = photon('http://example.com/foo.png', { secure: false });

    assertHostedOnPhotonInsecurely(photonedUrl);

    photonedUrl = photon('https://i0.wp.com/example.com/foo.png', { secure: false });

    assertHostedOnPhotonInsecurely(photonedUrl);
  });

  it('should allow you to turn off ssl for fetching', function() {
    var photonedUrl = photon('https://example.com/foo.png', { secure: false, ssl: 0 });

    assertHostedOnPhotonInsecurely(photonedUrl);
    assertQuery(photonedUrl, { ssl: 0 });

    photonedUrl = photon('https://i0.wp.com/example.com/foo.png', { secure: false, ssl: 0 });

    assertHostedOnPhotonInsecurely(photonedUrl);
    assertQuery(photonedUrl, { ssl: 0 });
  });

});
