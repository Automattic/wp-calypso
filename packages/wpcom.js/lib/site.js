
/**
 * Module dependencies.
 */

var Action = require('./action');
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
 * Require site data through WP REST API
 *
 * @param {Function} fn
 * @api public
 */

Site.prototype.info = function(fn){
  if (!this.id) {
    return fn(new Error('site `id` is not defined'));
  }

  req('site', { site: this.id }, opts, fn);
};

/**
 * require site posts
 *
 * @api public
 */

Site.prototype.posts = function(opts, fn){
  if (!this.id) {
    return fn(new Error('site `id` is not defined'));
  }

  req('posts', { site: this.id }, opts, fn);
};

/**
 * Expose `Site` module
 */

module.exports = Site;
