
/**
 * Module dependencies
 */

var qs = require('qs');
var debug = require('debug')('wpcom:send-request');
var debug_res = require('debug')('wpcom:send-request:res');

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
    query = {};
  }

  // `body` is optional
  if ('function' === typeof body) {
    fn = body;
    body = null;
  }

  // query could be `null`
  query = query || {};

  // pass `query` and/or `body` to request params
  params.query = query;

  // Handle special query parameters
  // - `apiVersion`
  if (query.apiVersion) {
    params.apiVersion = query.apiVersion;
    debug('apiVersion: %o', params.apiVersion);
    delete query.apiVersion;
  } else {
    params.apiVersion = this.apiVersion;
  }

  // - `proxyOrigin`
  if (query.proxyOrigin) {
    params.proxyOrigin = query.proxyOrigin;
    debug('proxyOrigin: %o', params.proxyOrigin);
    delete query.proxyOrigin;
  }

  // Stringify query object before to send
  query = qs.stringify(query);

  if (body) {
    params.body = body;
  }

  // callback `fn` function is optional
  if (!fn) {
    fn = function (err) { if (err) { throw err; } };
  }

  debug('params: %o', params);
  // request method
  return this.request(params, function(err, res) {
    debug_res(res);
    fn(err, res);
  });
};
