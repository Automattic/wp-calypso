/**
 * Like methods
 *
 * @param {string} pid - post id
 * @param {string} sid - site id
 * @param {WPCOM} wpcom - wpcom instance
 * @returns {null} null
 */
export default function Like( pid, sid, wpcom ) {
	if ( ! sid ) {
		throw new Error( '`site id` is not correctly defined' );
	}

	if ( ! pid ) {
		throw new Error( '`post id` is not correctly defined' );
	}

	if ( ! ( this instanceof Like ) ) {
		return new Like( pid, sid, wpcom );
	}

	this.wpcom = wpcom;
	this._pid = pid;
	this._sid = sid;
}

/**
 * Get your Like status for a Post
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 */
Like.prototype.mine = Like.prototype.state = function ( query, fn ) {
	var path = '/sites/' + this._sid + '/posts/' + this._pid + '/likes/mine';
	return this.wpcom.req.get( path, query, fn );
};

/**
 * Like a post
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Like.prototype.add = function ( query, fn ) {
	var path = '/sites/' + this._sid + '/posts/' + this._pid + '/likes/new';
	return this.wpcom.req.put( path, query, null, fn );
};

/**
 * Remove your Like from a Post
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 */
Like.prototype.del = Like.prototype.delete = function ( query, fn ) {
	var path = '/sites/' + this._sid + '/posts/' + this._pid + '/likes/mine/delete';
	return this.wpcom.req.del( path, query, fn );
};
