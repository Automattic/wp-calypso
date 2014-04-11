
/**
 * Module dependencies.
 */

var Post = require('./post');
var debug = require('debug')('wpcom:site');

/**
 * Create a Site instance
 *
 * @param {WPCOM} wpcom
 * @api public
 */

function Site(wpcom){
  if (!(this instanceof Site)) return new Site(wpcom);
  this.wpcom = wpcom;

  // post methods
  this.post = new Post(this.wpcom);
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
 * @param {Object} params (optional)
 * @param {Function} fn
 * @api public
 */

Site.prototype.info = function(params, fn){
  if (!this._id) {
    return fn(new Error('site `id` is not defined'));
  }

  this.wpcom.req.send('site.get', { site: this._id }, params, fn);
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

  this.wpcom.req.send('posts.get', { site: this._id }, params, fn);
};

/**
 * Expose `Site` module
 */

module.exports = Site;
