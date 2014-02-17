
/**
 * Module dependencies.
 */

var req = require('request');
var qs = require('querystring');
var ends = require('./lib/endpoints.js');
var merge = require('extend');
var debug = require('debug')('wp-connect');

/**
 * Default options
 */

var default_opts = {
  url: {
    api_rest_v1: "https://public-api.wordpress.com/rest/v1"
  }
};

/**
 * Globals
 */

var api_url = default_opts.url.api_rest_v1;

/**
 * Wordpress connect class
 *
 * @param {Object} options
 * @api public
 */

function WPCONN(options){
  this.options = options = {};
  this.headers = {};
}

/**
 * Set Resource ID (blog, etc ...)
 *
 * @param {String} id
 * @api public
 */

WPCONN.prototype.setResource = function(id){
  this.resource = id;
};

/**
 * Set Access token
 *
 * @param {String} token
 * @api public
 */

WPCONN.prototype.setToken = function(token){
  this.token = token;
  this.headers.authorization = "Bearer " + this.token;
};

/**
 * User profile
 *
 * @param {Object} opts (optional)
 * @param {Function} fn
 * @api private
 */

WPCONN.prototype.me = function (opts, fn){
  this.req('me', null, opts, fn);
};

/**
 * Get wordpress site info
 *
 * @param {String|Number} rid resource id
 * @param {Object} opts
 * @param {Function} fn
 * @api public
 */

WPCONN.prototype.site = function (rid, opts, fn){
  this.req('site', { site: rid }, opts, fn);
};

/**
 * Get wordpress posts
 *
 * @param {String} rid resource id
 * @param {Object} opts
 * @param {Function} fn
 * @api public
 */

WPCONN.prototype.posts = function (rid, opts, fn){
  this.req('posts', { site: rid }, opts, fn);
};

/**
 * Get WordPress post
 *
 * @param {Number} pid post id
 * @param {String} rid resource id
 * @param {Object} opts (optional)
 * @param {Function} fn
 * @api public
 */

WPCONN.prototype.post = function (pid, rid, opts, fn){
  var set = {
    site: rid,
    post_ID: pid
  };

  this.req('post', set, opts, fn);
};

/**
 * Request to WordPress REST API
 * 
 * @param {String} type
 * @param {Object} options
 * @param {Function} fn
 * @api private
 */

WPCONN.prototype.req = function(type, vars, opts, fn){
  debug('type: `%s`', type);

  if (!this.token) {
    debug('WARNING: token is not defined');
  }

  // options object - callback function
  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  } else {
    opts = opts || {};
  }

  // endpoint config object
  var end = ends(type);

  // build endpoint url
  var endpoint = end.path;

  if (vars) {
    for (var k in vars) {
      var rg = new RegExp("%" + k + "%");
      endpoint = endpoint.replace(rg, vars[k]);
    }
  }
  debug('endpoint: `%s`', endpoint);

  // build query string
  var qrs = {};
  merge(qrs, end.options, opts);
  qrs = qs.stringify(qrs);
  debug('qrs: `%s`', qrs);

  // build endurl
  var url = api_url + endpoint + '?' + qrs;
  debug('request to `%s`', url);

  req({ url: url, headers: this.headers }, function (err, res, body) {
    if (err) return fn(err);

    var data;
    try {
      data = JSON.parse(body);
    } catch(e) {
      return fn(e);
    }

    if (data.error) return fn(data);

    if ((/SyntaxError/).test(String(data))) {
      return fn(data);
    }

    debug('request successful');
    fn (null, data);
  });
};

/**
 * Expose `WPCONN` module
 */

module.exports = WPCONN;
