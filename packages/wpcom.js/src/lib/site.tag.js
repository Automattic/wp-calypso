/**
 * Tag methods
 *
 * @param {string} [slug] - tag slug
 * @param {string} sid - site id
 * @param {WPCOM} wpcom - wpcom instance
 * @returns {null} null
 */
export default function Tag( slug, sid, wpcom ) {
	if ( ! sid ) {
		throw new Error( '`site id` is not correctly defined' );
	}

	if ( ! ( this instanceof Tag ) ) {
		return new Tag( slug, sid, wpcom );
	}

	this.wpcom = wpcom;
	this._sid = sid;
	this._slug = slug;
}

/**
 * Set tag `slug`
 *
 * @param {string} slug - tag slug
 */
Tag.prototype.slug = function ( slug ) {
	this._slug = slug;
};

/**
 * Get tag
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Tag.prototype.get = function ( query, fn ) {
	var path = '/sites/' + this._sid + '/tags/slug:' + this._slug;
	return this.wpcom.req.get( path, query, fn );
};

/**
 * Add tag
 *
 * @param {object} [query] - query object parameter
 * @param {object} body - body object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Tag.prototype.add = function ( query, body, fn ) {
	var path = '/sites/' + this._sid + '/tags/new';
	return this.wpcom.req.post( path, query, body, fn );
};

/**
 * Edit tag
 *
 * @param {object} [query] - query object parameter
 * @param {object} body - body object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Tag.prototype.update = function ( query, body, fn ) {
	var path = '/sites/' + this._sid + '/tags/slug:' + this._slug;
	return this.wpcom.req.put( path, query, body, fn );
};

/**
 * Delete tag
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Tag.prototype.delete = Tag.prototype.del = function ( query, fn ) {
	var path = '/sites/' + this._sid + '/tags/slug:' + this._slug + '/delete';
	return this.wpcom.req.del( path, query, fn );
};
