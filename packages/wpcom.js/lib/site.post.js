/**
 * Module dependencies.
 */
var Like = require( './site.post.like' );
var Reblog = require( './site.post.reblog' );
var Comment = require( './site.comment' );
var debug = require( 'debug' )( 'wpcom:post' );

/**
 * Post methods
 *
 * @param {String} id - post id
 * @param {String} sid site id
 * @param {WPCOM} wpcom - wpcom instance
 * @return {Null} null
 */
function Post( id, sid, wpcom ) {
	if ( ! ( this instanceof Post ) ) {
		return new Post( id, sid, wpcom );
	}

	this.wpcom = wpcom;
	this._sid = sid;

	// set `id` and/or `slug` properties
	id = id || {};
	if ( 'object' !== typeof id ) {
		this._id = id;
	} else {
		this._id = id.id;
		this._slug = id.slug;
	}
}

/**
 * Set post `id`
 *
 * @param {String} id - site id
 */
Post.prototype.id = function( id ) {
	this._id = id;
};

/**
 * Set post `slug`
 *
 * @param {String} slug - site slug
 */
Post.prototype.slug = function( slug ) {
	this._slug = slug;
};

/**
 * Get post
 *
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @return {Function} request handler
 */
Post.prototype.get = function( query, fn ) {
	if ( ! this._id && this._slug ) {
		return this.getBySlug( query, fn );
	}

	let path = '/sites/' + this._sid + '/posts/' + this._id;
	return this.wpcom.req.get( path, query, fn );
};

/**
 * Get post by slug
 *
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @return {Function} request handler
 */
Post.prototype.getBySlug = function( query, fn ) {
	var path = '/sites/' + this._sid + '/posts/slug:' + this._slug;
	return this.wpcom.req.get( path, query, fn );
};

/**
 * Add post
 *
 * @param {Object} [query] - query object parameter
 * @param {Object} body - body object parameter
 * @param {Function} fn - callback function
 * @return {Function} request handler
 */
Post.prototype.add = function( query, body, fn ) {
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

	let path = '/sites/' + this._sid + '/posts/new';

	return this.wpcom.req.post( path, query, body )
		.then( data => {
			// update POST object
			this._id = data.ID;
			debug( 'Set post _id: %s', this._id );

			this._slug = data.slug;
			debug( 'Set post _slug: %s', this._slug );

			if ( 'function' === typeof fn ) {
				fn( null, data );
			} else {
				return Promise.resolve( data );
			}
		} )
		.catch( err => {
			if ( 'function' === typeof fn ) {
				fn( err );
			} else {
				return Promise.reject( err );
			}
		} );
};

/**
 * Edit post
 *
 * @param {Object} [query] - query object parameter
 * @param {Object} body - body object parameter
 * @param {Function} fn - callback function
 * @return {Function} request handler
 */
Post.prototype.update = function( query, body, fn ) {
	var path = '/sites/' + this._sid + '/posts/' + this._id;
	return this.wpcom.req.put( path, query, body, fn );
};

/**
 * Delete post
 *
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 */
Post.prototype.del =
Post.prototype.delete = function( query, fn ) {
	var path = '/sites/' + this._sid + '/posts/' + this._id + '/delete';
	return this.wpcom.req.del( path, query, fn );
};

/**
 * Restore post
 *
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @return {Function} request handler
 */
Post.prototype.restore = function( query, fn ) {
	var path = '/sites/' + this._sid + '/posts/' + this._id + '/restore';
	return this.wpcom.req.put( path, query, null, fn );
};

/**
 * Get post likes list
 *
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @return {Function} request handler
 */
Post.prototype.likesList = function( query, fn ) {
	var path = '/sites/' + this._sid + '/posts/' + this._id + '/likes';
	return this.wpcom.req.get( path, query, fn );
};

/**
 * Search within a site for related posts
 *
 * @param {Object} body - body object parameter
 * @param {Function} fn - callback function
 * @return {Function} request handler
 */
Post.prototype.related = function( body, fn ) {
	var path = '/sites/' + this._sid + '/posts/' + this._id + '/related';
	return this.wpcom.req.put( path, body, null, fn );
};

/**
 * Create a `Like` instance
 *
 * @return {Like} Like instance
 */
Post.prototype.like = function() {
	return new Like( this._id, this._sid, this.wpcom );
};

/**
 * Create a `Reblog` instance
 *
 * @return {Reblog} Reblog instance
 */
Post.prototype.reblog = function() {
	return new Reblog( this._id, this._sid, this.wpcom );
};

/**
 * Create a `Comment` instance
 *
 * @param {String} [cid] - comment id
 * @return {Comment} Comment instance
 */
Post.prototype.comment = function( cid ) {
	return new Comment( cid, this._id, this._sid, this.wpcom );
};

/**
 * Return recent comments
 *
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @return {Function} request handler
 */
Post.prototype.comments = function( query, fn ) {
	var comment = new Comment( null, this._id, this._sid, this.wpcom );
	return comment.replies( query, fn );
};

/**
 * Expose `Post` module
 */
module.exports = Post;
