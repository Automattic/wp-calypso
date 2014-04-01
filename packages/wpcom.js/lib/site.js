
/**
 * Module dependencies.
 */

var Post = require('./post');
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
  this.post = new Post(this.wpconn);
}

/**
 * Set site identifier
 *
 * @api public
 */

Site.prototype.id = function(id){
  debug('set `%s` site id', id);
  this._id = id;
};

/**
 * Require site information
 *
 * @param {Function} fn
 * @api public
 */

Site.prototype.info = function(params, fn){
  if (!this._id) {
    return fn(new Error('site `id` is not defined'));
  }

  this.wpconn.req.send('site.get', { site: this._id }, params, fn);
};

/**
 * Require posts site
 *
 * @param {Object} params (optional)
 * @param {Function} fn
 * @api public
 */

Site.prototype.posts = function(params, fn){
  if (!this._id) {
    return fn(new Error('site `id` is not defined'));
  }

  this.wpconn.req.send('posts.get', { site: this._id }, params, fn);
};

/**
 * Expose `Site` module
 */

module.exports = Site;
