
/**
 * Module dependencies.
 */

var debug = require('debug')('wpcom:category');

/**
 * Category methods
 *
 * @param {String} [slug]
 * @param {String} sid site id
 * @param {WPCOM} wpcom
 * @api public
 */

function Category(slug, sid, wpcom) {
  if (!sid) {
    throw new Error('`side id` is not correctly defined');
  }

  if (!(this instanceof Category)) {
    return new Category(slug, sid, wpcom);
  }

  this.wpcom = wpcom;
  this._sid = sid;
  this._slug = slug;
}

/**
 * Set category `slug`
 *
 * @param {String} slug
 * @api public
 */

Category.prototype.slug = function (slug) {
  this._slug = slug;
};

/**
 * Get category
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Category.prototype.get = function (query, fn) {
  var path = '/sites/' + this._sid + '/categories/slug:' + this._slug;
  return this.wpcom.req.get(path, query, fn);
};

/**
 * Add category
 *
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Category.prototype.add = function (query, body, fn) {
  var path = '/sites/' + this._sid + '/categories/new';
  return this.wpcom.req.post(path, query, body, fn);
};

/**
 * Edit category
 *
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Category.prototype.update = function (query, body, fn) {
  var path = '/sites/' + this._sid + '/categories/slug:' + this._slug;
  return this.wpcom.req.put(path, query, body, fn);
};

/**
 * Delete category
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Category.prototype['delete'] = Category.prototype.del = function (query, fn) {
  var path = '/sites/' + this._sid + '/categories/slug:' + this._slug + '/delete';
  return this.wpcom.req.del(path, query, fn);
};

/**
 * Expose `Category` module
 */

module.exports = Category;