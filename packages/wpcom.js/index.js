
/**
 * Module dependencies.
 */

var Me = require('./lib/me');
var Site = require('./lib/site');
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
 * Get me object instance
 *
 * @api public
 */

WPCOM.prototype.me = function(){
  return new Me(this);
};

/**
 * Get site object instance
 *
 * @param {String} id
 * @api public
 */

WPCOM.prototype.site = function(id){
  return new Site(id, this);
};

/**
 * List Freshly Pressed Posts
 *
 * @param {Object} params (optional)
 * @param {Function} fn callback function
 * @api public
 */

WPCOM.prototype.freshlyPressed = function(params, fn){
  this.sendRequest('freshly-pressed.get', null, params, fn);
};

/**
 * Request to WordPress REST API
 *
 * @param {String||Object} params 
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

/**
 * Expose `WPCOM` module
 */

module.exports = WPCOM;
