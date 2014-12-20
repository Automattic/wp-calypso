
/**
 * Module dependencies.
 */

var url = require('url');
var crc32 = require('crc32');
var seed = require('seed-random');
var debug = require('debug')('photon');

/**
 * Module exports.
 */

module.exports = photon;

/**
 * Options argument to query string parameter mappings.
 */

var mappings = {
  'width': 'w',
  'height': 'h',
  'letterboxing': 'lb',
  'removeLetterboxing': 'ulb'
};

/**
 * Returns a "photon" URL from the given image URL.
 *
 * Defaults to returning an `https:` secure URL from Photon.
 * Pass `secure: false` to get `http:`.
 *
 * Photon documentation: http://developer.wordpress.com/docs/photon/
 *
 * @param {String} imageUrl - the URL of the image to run through Photon
 * @param {Object} [opts] - optional options object with Photon options
 * @return {String} The generated Photon URL string
 * @api public
 */

function photon (imageUrl, opts) {

  // strip any leading `http(s)://`
  imageUrl = imageUrl.replace(/^https?\:\/\/(i\d.wp.com\/)?/i, '');

  // determine which Photon server to connect to: `i0`, `i1`, or `i2`.
  // statically hash the subdomain based on the URL, to optimize browser caches.
  var hash = crc32(imageUrl);
  var rng = seed(hash);
  var server = 'i' + Math.floor(rng() * 3);
  debug('determined server "%s" to use with "%s"', server, imageUrl);

  var params = {
    slashes: true,
    pathname: imageUrl,
    protocol: 'https:',
    hostname: server + '.wp.com'
  };

  if (opts) {
    for (var i in opts) {

      // allow configurable "hostname"
      if (i === 'host' || i === 'hostname') {
        params.hostname = opts[i];
        continue;
      }

      // allow non-secure access
      if (i === 'secure' && !opts[i]) {
        params.protocol = 'http:';
        continue;
      }

      // any other options just gets passed through as query-string parameters
      if (!params.query) params.query = {};

      params.query[mappings[i] || i] = opts[i];
    }
  }

  // prevent inception (attempting to Photon-ify a link that
  // already is already pointing to the Photon hostname)
  var h = params.hostname + '/';
  if (0 === params.pathname.indexOf(h)) {
    debug('preventing Photon URL "inception", stripping leading "%s"', h);
    params.pathname = params.pathname.substring(h.length);
  }

  var photonUrl = url.format(params);
  debug('generated Photon URL: %s', photonUrl);
  return photonUrl;
}
