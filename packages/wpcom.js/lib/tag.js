
/**
 * Module dependencies.
 */

var debug = require('debug')('wpcom:tag');

/**
 * Tag methods
 *
 * @param {String} [slug]
 * @param {String} sid site id
 * @param {WPCOM} wpcom
 * @api public
 */

function Tag(slug, sid, wpcom){
  if (!sid) {
    throw new Error('`side id` is not correctly defined');
  }

  if (!(this instanceof Tag)) return new Tag(slug, sid, wpcom);

  this.wpcom = wpcom;
  this._sid = sid;
  this._slug = slug;
}

/**
 * Set tag `slug`
 *
 * @param {String} slug
 * @api public
 */

Tag.prototype.slug = function(slug){
  this._slug = slug;
};

/**
 * Get tag
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Tag.prototype.get = function(query, fn){
  var path = '/sites/' + this._sid + '/tags/slug:' + this._slug;
  return this.wpcom.sendRequest(path, query, null, fn);
};

/**
 * Add tag
 *
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Tag.prototype.add = function(body, fn){
  var path = '/sites/' + this._sid + '/tags/new';
  return this.wpcom.sendRequest({ path: path, method: 'post' }, null, body, fn);
};

/**
 * Edit tag
 *
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Tag.prototype.update = function(body, fn){
  var path = '/sites/' + this._sid + '/tags/slug:' + this._slug;
  return this.wpcom.sendRequest({ path: path, method: 'post' }, null, body, fn);
};

/**
 * Delete tag
 *
 * @param {Function} fn
 * @api public
 */

Tag.prototype['delete'] =
Tag.prototype.del = function(fn){
  var path = '/sites/' + this._sid + '/tags/slug:' + this._slug + '/delete';
  return this.wpcom.sendRequest({ path: path, method: 'post' }, null, null, fn);
};

/**
 * Expose `Tag` module
 */

module.exports = Tag;
