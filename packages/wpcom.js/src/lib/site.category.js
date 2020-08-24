/**
 * Category methods
 *
 * @param {string} [slug] - category slug
 * @param {string} sid - site id
 * @param {WPCOM} wpcom - wpcom instance
 * @returns {null} null
 */
export default function Category( slug, sid, wpcom ) {
	if ( ! sid ) {
		throw new Error( '`site id` is not correctly defined' );
	}

	if ( ! ( this instanceof Category ) ) {
		return new Category( slug, sid, wpcom );
	}

	this.wpcom = wpcom;
	this._sid = sid;
	this._slug = slug;
}

/**
 * Set category `slug`
 *
 * @param {string} slug - category slug
 */
Category.prototype.slug = function ( slug ) {
	this._slug = slug;
};

/**
 * Get category
 *
 * @param {object} [query] - query object parameter - query object parameter
 * @param {Function} fn - callback function - callback
 * @returns {Function} request handler
 */
Category.prototype.get = function ( query, fn ) {
	var path = '/sites/' + this._sid + '/categories/slug:' + this._slug;
	return this.wpcom.req.get( path, query, fn );
};

/**
 * Add category
 *
 * @param {object} [query] - query object parameter
 * @param {object} body - body object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Category.prototype.add = function ( query, body, fn ) {
	var path = '/sites/' + this._sid + '/categories/new';
	return this.wpcom.req.post( path, query, body, fn );
};

/**
 * Edit category
 *
 * @param {object} [query] - query object parameter
 * @param {object} body - body object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Category.prototype.update = function ( query, body, fn ) {
	var path = '/sites/' + this._sid + '/categories/slug:' + this._slug;
	return this.wpcom.req.put( path, query, body, fn );
};

/**
 * Delete category
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Category.prototype.delete = Category.prototype.del = function ( query, fn ) {
	var path = '/sites/' + this._sid + '/categories/slug:' + this._slug + '/delete';
	return this.wpcom.req.del( path, query, fn );
};
