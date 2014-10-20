
/**
 * Module dependencies.
 */

var Me = require('./lib/me');
var Site = require('./lib/site');
var Batch = require('./lib/batch');
var debug = require('debug')('wpcom');

/**
 * WordPress.com REST API class.
 *
 * @api public
 */

function WPCOM(request){
  if (!(this instanceof WPCOM)) return new WPCOM(request);
  if ('function' !== typeof request) {
    throw new TypeError('a `request` WP.com function must be passed in');
  }

  this.request = request;
}

/**
 * Get `Me` object instance
 *
 * @api public
 */

WPCOM.prototype.me = function(){
  return new Me(this);
};

/**
 * Get `Site` object instance
 *
 * @param {String} id
 * @api public
 */

WPCOM.prototype.site = function(id){
  return new Site(id, this);
};


WPCOM.prototype.batch = function(){
  return new Batch(this);
};

/**
 * List Freshly Pressed Posts
 *
 * @param {Object} [query]
 * @param {Function} fn callback function
 * @api public
 */

WPCOM.prototype.freshlyPressed = function(query, fn){
  return this.sendRequest('/freshly-pressed', query, null, fn);
};

/**
 * Request to WordPress REST API
 *
 * @param {String|Object} params
 * @param {Object} [query]
 * @param {Object} [body]
 * @param {Function} fn
 * @api private
 */

WPCOM.prototype.sendRequest = function (params, query, body, fn){
  // `params` can be just the path (String)
  if ('string' == typeof params) {
    params = { path: params };
  }

  debug('sendRequest(%o)', params.path);

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
  return this.request(params, fn);
};

/**
 * Expose `WPCOM` module
 */

module.exports = WPCOM;
