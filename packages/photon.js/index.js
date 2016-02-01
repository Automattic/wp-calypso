
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

  // parse the URL, assuming //host.com/path style URLs are ok and parse the querystring
  var parsedUrl = url.parse( imageUrl, true, true ),
    wasSecure = parsedUrl.protocol === 'https:';

  delete parsedUrl.protocol;
  delete parsedUrl.auth;
  delete parsedUrl.port;

  var params = {
    slashes: true,
    protocol: 'https:',
    query: {}
  };

  if ( isAlreadyPhotoned( parsedUrl.host ) ) {
    // We already have a server to use.
    // Use it, even if it doesn't match our hash.
    params.pathname = parsedUrl.pathname;
    params.hostname = parsedUrl.hostname;
  } else {
    // Photon does not support URLs with a querystring component
    if (parsedUrl.search) {
      return null;
    }
    params.pathname = url.format( parsedUrl ).substring(1);
    params.hostname = serverFromPathname( params.pathname );
    if ( wasSecure ) {
      params.query.ssl = 1;
    }
  }

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

      params.query[mappings[i] || i] = opts[i];
    }
  }

  // do this after so a passed opt can't override it


  var photonUrl = url.format(params);
  debug('generated Photon URL: %s', photonUrl);
  return photonUrl;
}

function isAlreadyPhotoned( host ) {
  return /^i[0-2]\.wp\.com$/.test(host);
}

/**
 * Determine which Photon server to connect to: `i0`, `i1`, or `i2`.
 *
 * Statically hash the subdomain based on the URL, to optimize browser caches.
 * @param  {string} pathname The pathname to use
 * @return {string}          The hostname for the pathname
 */
function serverFromPathname( pathname ) {
  var hash = crc32(pathname);
  var rng = seed(hash);
  var server = 'i' + Math.floor(rng() * 3);
  debug('determined server "%s" to use with "%s"', server, pathname);
  return server + '.wp.com';
}
