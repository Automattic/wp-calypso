/**
 * CommentLike methods
 *
 * @param {string} cid comment id
 * @param {string} sid site id
 * @param {WPCOM} wpcom - wpcom instance
 * @returns {null} null
 */
export default function CommentLike( cid, sid, wpcom ) {
	if ( ! sid ) {
		throw new Error( '`site id` is not correctly defined' );
	}

	if ( ! cid ) {
		throw new Error( '`comment id` is not correctly defined' );
	}

	if ( ! ( this instanceof CommentLike ) ) {
		return new CommentLike( cid, sid, wpcom );
	}

	this.wpcom = wpcom;
	this._cid = cid;
	this._sid = sid;
}

/**
 * Get your Like status for a Comment
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
CommentLike.prototype.mine = CommentLike.prototype.state = function ( query, fn ) {
	var path = '/sites/' + this._sid + '/comments/' + this._cid + '/likes/mine';
	return this.wpcom.req.get( path, query, fn );
};

/**
 * Like a comment
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
CommentLike.prototype.add = function ( query, fn ) {
	var path = '/sites/' + this._sid + '/comments/' + this._cid + '/likes/new';
	return this.wpcom.req.post( path, query, fn );
};

/**
 * Remove your Like from a Comment
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
CommentLike.prototype.del = CommentLike.prototype.delete = function ( query, fn ) {
	var path = '/sites/' + this._sid + '/comments/' + this._cid + '/likes/mine/delete';
	return this.wpcom.req.del( path, query, fn );
};
