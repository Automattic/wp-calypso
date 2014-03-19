
/**
 * Module dependencies.
 */

var Post = require('./post');
var req = require('./req');
var debug = require('debug')('wp-connect:site');

/**
 * Create a Site instance
 *
 * @param {Site} wpconn
 * @api public
 */

function Site(wpconn){
  if (!(this instanceof Site)) return new Site(wpconn);
  this.wpconn = wpconn;

  // post methods
  this.post = new Post(this);
}

/**
 * Set site identifier
 *
 * @api public
 */

Site.prototype.setId = function(id){
  debug('set `%s` site id', id);
  this.id = id;
};

/**
 * Require site information through of WP REST API
 *
 * @param {Function} fn
 * @api public
 */

Site.prototype.info = function(fn){
  if (!this.id) {
    return fn(new Error('site `id` is not defined'));
  }

  req('site', { site: this.id }, fn);
};

/**
 * Require posts site through of WP REST API
 *
 * @param {Object} params (optional)
 * @param {Function} fn
 * @api public
 */

Site.prototype.posts = function(params, fn){
  fn = fn || params;
  params = 'function' == typeof obj ? {} : (params || {});

  if (!this.id) {
    return fn(new Error('site `id` is not defined'));
  }

  req('posts', { site: this.id }, params, fn);
};

/**
 * Expose `Site` module
 */

module.exports = Site;
