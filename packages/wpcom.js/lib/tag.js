/**
 * Tag methods
 *
 * @param {String} [slug]
 * @param {String} sid site id
 * @param {WPCOM} wpcom
 * @api public
 */

function Tag(slug, sid, wpcom) {
  if (!sid) {
    throw new Error('`site id` is not correctly defined');
  }

  if (!(this instanceof Tag)) {
    return new Tag(slug, sid, wpcom);
  }

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

Tag.prototype.slug = function (slug) {
  this._slug = slug;
};

/**
 * Get tag
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Tag.prototype.get = function (query, fn) {
  var path = '/sites/' + this._sid + '/tags/slug:' + this._slug;
  return this.wpcom.req.get(path, query, fn);
};

/**
 * Add tag
 *
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Tag.prototype.add = function (query, body, fn) {
  var path = '/sites/' + this._sid + '/tags/new';
  return this.wpcom.req.post(path, query, body, fn);
};

/**
 * Edit tag
 *
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Tag.prototype.update = function (query, body, fn) {
  var path = '/sites/' + this._sid + '/tags/slug:' + this._slug;
  return this.wpcom.req.put(path, query, body, fn);
};

/**
 * Delete tag
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Tag.prototype['delete'] = Tag.prototype.del = function (query, fn) {
  var path = '/sites/' + this._sid + '/tags/slug:' + this._slug + '/delete';
  return this.wpcom.req.del(path, query, fn);
};

/**
 * Expose `Tag` module
 */

module.exports = Tag;