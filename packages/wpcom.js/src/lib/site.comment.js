/**
 * Comment methods
 * @param {string} [cid] comment id
 * @param {string} [pid] post id
 * @param {string} sid site id
 * @param {WPCOM} wpcom - wpcom instance
 * @returns {Comment|undefined}
 */
export default function Comment( cid, pid, sid, wpcom ) {
	if ( ! sid ) {
		throw new Error( '`site id` is not correctly defined' );
	}

	if ( ! ( this instanceof Comment ) ) {
		return new Comment( cid, pid, sid, wpcom );
	}

	this.wpcom = wpcom;
	this._cid = cid;
	this._pid = pid;
	this._sid = sid;
}

/**
 * Return a single Comment
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Comment.prototype.get = function ( query, fn ) {
	const path = '/sites/' + this._sid + '/comments/' + this._cid;
	return this.wpcom.req.get( path, query, fn );
};

/**
 * Return recent comments for a post
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Comment.prototype.replies = function ( query, fn ) {
	const path = '/sites/' + this._sid + '/posts/' + this._pid + '/replies/';
	return this.wpcom.req.get( path, query, fn );
};

/**
 * Create a comment on a post
 * @param {Object} [query] - query object parameter
 * @param {string | Object} body - body parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Comment.prototype.add = function ( query, body, fn ) {
	if ( undefined === fn ) {
		if ( undefined === body ) {
			body = query;
			query = {};
		} else if ( 'function' === typeof body ) {
			fn = body;
			body = query;
			query = {};
		}
	}

	body = 'string' === typeof body ? { content: body } : body;

	const path = '/sites/' + this._sid + '/posts/' + this._pid + '/replies/new';
	return this.wpcom.req.post( path, query, body, fn );
};

/**
 * Edit a comment
 * @param {Object} [query] - query object parameter
 * @param {string | Object} body - body parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Comment.prototype.update = function ( query, body, fn ) {
	if ( 'function' === typeof body ) {
		fn = body;
		body = query;
		query = {};
	}

	body = 'string' === typeof body ? { content: body } : body;

	const path = '/sites/' + this._sid + '/comments/' + this._cid;
	return this.wpcom.req.put( path, query, body, fn );
};

/**
 * Create a Comment as a reply to another Comment
 * @param {Object} [query] - query object parameter
 * @param {string | Object} body - body parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Comment.prototype.reply = function ( query, body, fn ) {
	if ( 'function' === typeof body ) {
		fn = body;
		body = query;
		query = {};
	}

	body = 'string' === typeof body ? { content: body } : body;

	const path = '/sites/' + this._sid + '/comments/' + this._cid + '/replies/new';
	return this.wpcom.req.post( path, query, body, fn );
};

/**
 * Delete a comment
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Comment.prototype.del = Comment.prototype.delete = function ( query, fn ) {
	const path = '/sites/' + this._sid + '/comments/' + this._cid + '/delete';
	return this.wpcom.req.del( path, query, fn );
};
