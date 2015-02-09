
/**
 * Module dependencies
 */

var debug = require('debug')('wpcom:send-request');

/**
 * Request to WordPress REST API
 *
 * @param {String|Object} params
 * @param {Object} [query]
 * @param {Object} [body]
 * @param {Function} fn
 * @api private
 */

module.exports = function (params, query, body, fn) {
  // `params` can be just the path (String)  
  params = 'string' === typeof params ? { path : params } : params;

  debug('sendRequest(%o)', params.path);

  // set `method` request param
  params.method = (params.method || 'get').toUpperCase();

  // `query` is optional
  if ('function' === typeof query) {
    fn = query;
    query = null;
  }

  // `body` is optional
  if ('function' === typeof body) {
    fn = body;
    body = null;
  }

  // pass `query` and/or `body` to request params
  if (query) {
    params.query = query;

    // Handle special query parameters
    // - `apiVersion`
    if (query.apiVersion) {
      params.apiVersion = query.apiVersion;
      delete query.apiVersion;
    } else {
      params.apiVersion = this.apiVersion;
    }
  }

  if (body) {
    params.body = body;
  }

  // callback `fn` function is optional
  if (!fn) {
    fn = function (err) { if (err) { throw err; } };
  }

  // request method
  return this.request(params, fn);
};