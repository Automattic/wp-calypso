
/**
 * Module dependencies.
 */

var Action = require('./lib/action');
var Blog = require('./lib/blog');
var req = require('./lib/req');
var debug = require('debug')('wp-connect');

/**
 * Wordpress connect class
 *
 * @param {Object} options
 * @api public
 */

function WPCONN(options){
  this.options = options = {};
  this.headers = {};

  // post methods
  this.post = new Action('post', this);
}

/**
 * Create and return a new Blog instance
 *
 * @api public
 */

WPCONN.prototype.blog = function(token){
  return new Blog(token, this);
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
  opts.token = opts.token || this.token;
  req('me', null, opts, fn);
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
  req('site', { site: rid }, opts, fn);
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
  opts.token = opts.token || this.token;
  req('posts', { site: rid }, opts, fn);
};

/**
 * Expose `WPCONN` module
 */

module.exports = WPCONN;
