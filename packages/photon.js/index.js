
/**
 * Module dependencies.
 */

var url = require('url');
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

  if (/^https\:/i.test(imageUrl)) {
    debug('WARN: `https://` URLs are not supported, standard port 80 access will be attempted');
  }

  // strip any leading `http(s)://`
  imageUrl = imageUrl.replace(/^https?\:\/\//i, '');

  var params = {
    slashes: true,
    pathname: imageUrl,
    protocol: 'https:',
    hostname: 'i0.wp.com'
  };

  if (opts) {
    for (var i in opts) {

      // allow configurable "hostname"
      if (i === 'host' || i === 'hostname') {
        params.hostname = opts[i];
        continue;
      }

      // any other options just gets passed through as query-string parameters
      if (!params.query) params.query = {};

      params.query[mappings[i] || i] = opts[i];
    }
  }

  var photonUrl = url.format(params);
  debug('generated Photon URL: %s', photonUrl);
  return photonUrl;
}
