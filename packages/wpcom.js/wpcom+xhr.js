
/**
 * Module dependencies.
 */

var _WPCOM = require('./index.js');
var request = require('wpcom-xhr-request');
var inherits = require('inherits');

/**
 * Module exports.
 */

module.exports = WPCOM;

/**
 * WordPress.com REST API class.
 *
 * XMLHttpRequest (and CORS) API access method.
 * API authentication is done via an (optional) access `token`,
 * which needs to be retrieved via OAuth (see `wpcom-oauth` on npm).
 *
 * @param {String} token (optional) OAuth API access token
 * @api public
 */

function WPCOM (token) {
  if (!(this instanceof WPCOM)) return new WPCOM(token);
  _WPCOM.call(this, request);
  this.token = token;
}
inherits(WPCOM, _WPCOM);

/**
 * Overwrite the parent `sendRequest()` function so that we can
 * add the `authToken` to every API request if it's present.
 *
 * @api private
 */

WPCOM.prototype.sendRequest = function (type, vars, params, fn){
  // options object || callback function
  if ('function' == typeof params) {
    fn = params;
    params = {};
  }

  if (!params) params = {};

  // token
  var token = params.token || this.token;
  delete params.token;

  if (token) params.authToken = token;

  return _WPCOM.prototype.sendRequest.call(this, type, vars, params, fn);
};
