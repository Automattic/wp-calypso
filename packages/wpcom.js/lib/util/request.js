
/**
 * Module dependencies.
 */

var debug = require('debug')('wpcom:request');

/**
 * Expose `Request` module
 */

exports = module.exports = {};

/**
 * Request methods
 *
 * @param {WPCOM} wpcom
 * @param {Object} def
 * @param {Object|String} params
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

exports.get = function (wpcom, def, params, query, fn) {
  // `query` is optional
  if ('function' == typeof query) {
    fn = query;
    query = {};
  }
  
  defaultValues(def, query);

  return wpcom.sendRequest(params, query, null, fn);
};

/**
 * Make `update` request
 *
 * @param {WPCOM} wpcom
 * @param {Object} def
 * @param {Object|String} params
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

exports.put = 
exports.post = function (wpcom, def, params, query, body, fn) {
  if ('function' === typeof body) {
    fn = body;
    body = query;
    query = {};
  }

  defaultValues(def, query);

  // params can be s string
  params = 'string' === typeof params ? { path : params } : params;

  // request method
  params.method = 'post';

  return wpcom.sendRequest(params, query, body, fn);
};

/**
 * Make a `delete` request
 *
 * @param {WPCOM} wpcom
 * @param {Object} def
 * @param {Object|String} params
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

exports.del = function (wpcom, def, params, query, fn) {  
  if ('function' == typeof query) {
    fn = query;
    query = {};
  }

  return exports.post(wpcom, def, params, query, null, fn);
};

/**
 * Set query object using the given parameters
 *
 * @api private
 */

function defaultValues (def, query) {
  def = def || {};
  query = query || {};

  // `apiVersion`
  if (def.apiVersion) {
    query.apiVersion = query.apiVersion || def.apiVersion;
  }
};