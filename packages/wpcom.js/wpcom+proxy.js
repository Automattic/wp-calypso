
/**
 * Module dependencies.
 */

var _WPCOM = require('./index.js');
var request = require('wpcom-proxy-request');
var inherits = require('inherits');

/**
 * Module exports.
 */

module.exports = WPCOM;

/**
 * WordPress.com REST API class.
 *
 * Utilizes the proxy <iframe> technique for API access method
 * and cookie-based authentication.
 *
 * @api public
 */

function WPCOM () {
  if (!(this instanceof WPCOM)) return new WPCOM();
  _WPCOM.call(this, request);
}

/**
 * Inherit from `WPCOM`
 */

inherits(WPCOM, _WPCOM);
