/**
 * Follow
 *
 * @param {string} site_id - site id
 * @param {WPCOM} wpcom - wpcom instance
 * @returns {null} null
 */
export default function Follow( site_id, wpcom ) {
	if ( ! site_id ) {
		throw new Error( '`site id` is not correctly defined' );
	}

	if ( ! ( this instanceof Follow ) ) {
		return new Follow( site_id, wpcom );
	}

	this.wpcom = wpcom;
	this._sid = site_id;
}

/**
 * Get the follow status for current
 * user on current blog sites
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Follow.prototype.mine = Follow.prototype.state = function ( query, fn ) {
	var path = '/sites/' + this._sid + '/follows/mine';
	return this.wpcom.req.get( path, query, fn );
};

/**
 * Follow the site
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Follow.prototype.follow = Follow.prototype.add = function ( query, fn ) {
	var path = '/sites/' + this._sid + '/follows/new';
	return this.wpcom.req.put( path, query, null, fn );
};

/**
 * Unfollow the site
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Follow.prototype.unfollow = Follow.prototype.del = function ( query, fn ) {
	var path = '/sites/' + this._sid + '/follows/mine/delete';
	return this.wpcom.req.del( path, query, null, fn );
};
