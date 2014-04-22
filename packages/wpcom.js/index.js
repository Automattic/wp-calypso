
/**
 * Module dependencies.
 */

var Me = require('./lib/me');
var Sites = require('./lib/sites');
var ends = require('./lib/endpoint');
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

WPCOM.prototype.sites = function(id){
  return new Sites(id, this);
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
 * @param {String} type endpoint type
 * @param {Object} vars to build endpoint
 * @param {Object} params
 * @param {Function} fn
 * @api private
 */

WPCOM.prototype.sendRequest = function (type, vars, params, fn){
  debug('sendRequest("%s")', type);

  // params.query || callback function
  if ('function' == typeof params.query) {
    fn = params.query;
    params.query = {};
  }

  if (!fn) fn = function(err){ if (err) throw err; };

  // endpoint config object
  var end = ends(type);

  // request method
  params.method = (params.method || end.method || 'GET').toUpperCase();

  // build endpoint url
  var endpoint = end.path;
  if (vars) {
    for (var k in vars) {
      var rg = new RegExp("%" + k + "%");
      endpoint = endpoint.replace(rg, vars[k]);
    }
  }
  params.path = endpoint;
  debug('endpoint: `%s`', endpoint);

  this.request(params, fn);
};

/**
 * Expose `WPCOM` module
 */

module.exports = WPCOM;
