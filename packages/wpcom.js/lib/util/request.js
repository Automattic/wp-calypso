
/**
 * Module dependencies.
 */

var sendRequest = require('./send-request');
var debug = require('debug')('wpcom:request');

/**
 * Expose `Request` module
 */


function Req(wpcom) {
  this.wpcom = wpcom;
}

/**
 * Request methods
 *
 * @param {Object|String} params
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Req.prototype.get = function (params, query, fn) {
  // `query` is optional
  if ('function' == typeof query) {
    fn = query;
    query = {};
  }
  
  return sendRequest.call(this.wpcom, params, query, null, fn);
};

/**
 * Make `update` request
 *
 * @param {Object|String} params
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Req.prototype.put =
Req.prototype.post = function (params, query, body, fn) {
  if ('function' === typeof body) {
    fn = body;
    body = query;
    query = {};
  }

  // params can be a string
  params = 'string' === typeof params ? { path : params } : params;

  // request method
  params.method = 'post';

  return sendRequest.call(this.wpcom, params, query, body, fn);
};

/**
 * Make a `delete` request
 *
 * @param {Object|String} params
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Req.prototype.del = function (params, query, fn) {
  if ('function' == typeof query) {
    fn = query;
    query = {};
  }

  return this.post(params, query, null, fn);
};

/**
 * Expose module
 */

module.exports = Req;