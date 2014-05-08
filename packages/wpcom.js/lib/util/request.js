
/**
 * Module dependencies
 */

var debug = require('debug')('wpcom:request');

/**
 * Request to WordPress REST API
 *
 * @param {String||Object} params
 * @param {Object} [query]
 * @param {Object} [body]
 * @param {Function} fn
 * @api private
 */

module.exports = function (params, query, body, fn){
  // `params` can be just the path (String)
  if ('string' == typeof params) {
    params = { path: params };
  }

  debug('sendRequest("%s")', params.path);

  // set `method` request param
  params.method = (params.method || 'get').toUpperCase();

  // `query` is optional
  if ('function' == typeof query) {
    fn = query;
    query = null;
  }

  // `body` is optional
  if ('function' == typeof body) {
    fn = body;
    body = null;
  }

  // pass `query` and/or `body` to request params
  if (query) params.query = query;
  if (body) params.body = body;

  // callback `fn` function is optional
  if (!fn) fn = function(err){ if (err) throw err; };

  // request method
  this.request(params, fn);
};

