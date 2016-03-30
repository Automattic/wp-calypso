/**
 * Module dependencies.
 */
import Like from './site.post.like';
import Reblog from './site.post.reblog';
import Comment from './site.comment';
import Subscriber from './site.post.subscriber';
import runtimeBuilder from './util/runtime-builder';
import sitePostGetMethods from './runtime/site.post.get.json';
import debugFactory from 'debug';

/**
 * Module vars
 */
const debug = debugFactory( 'wpcom:post' );
const root = '/sites';

/**
 * SitePost class
 */
class SitePost {
	/**
	 * SitePost methods
	 *
	 * @param {String} id - post id
	 * @param {String} sid site id
	 * @param {WPCOM} wpcom - wpcom instance
	 * @return {Null} null
	 */
	constructor( id, sid, wpcom ) {
		if ( ! ( this instanceof SitePost ) ) {
			return new SitePost( id, sid, wpcom );
		}

		this.wpcom = wpcom;
		this._sid = sid;
		this.path = `${root}/${this._sid}/posts`;

		// set `id` and/or `slug` properties
		id = id || {}
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
	id( id ) {
		this._id = id;
	}

	/**
	 * Set post `slug`
	 *
	 * @param {String} slug - site slug
	 */
	slug( slug ) {
		this._slug = slug;
	}

	/**
	 * Get post url path
	 *
	 * @return {String} post path
	 */

	getPostPath() {
		return `${this.path}/${this._id}`;
	}

	/**
	 * Get post
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	get( query, fn ) {
		if ( ! this._id && this._slug ) {
			return this.getBySlug( query, fn );
		}

		return this.wpcom.req.get( this.getPostPath(), query, fn );
	}

	/**
	 * Get post by slug
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	getBySlug( query, fn ) {
		return this.wpcom.req.get( `${this.path}/slug:${this._slug}`, query, fn );
	}

	/**
	 * Add post
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Object} body - body object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	add( query, body, fn ) {
		if ( undefined === fn ) {
			if ( undefined === body ) {
				body = query;
				query = {}
			} else if ( 'function' === typeof body ) {
				fn = body;
				body = query;
				query = {}
			}
		}

		return this.wpcom.req.post( `${this.path}/new`, query, body )
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
	}

	/**
	 * Edit post
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Object} body - body object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	update( query, body, fn ) {
		return this.wpcom.req.put( this.getPostPath(), query, body, fn );
	}

	/**
	 * Delete post
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Promise} Promise
	 */
	delete( query, fn ) {
		const path = `${this.getPostPath()}/delete`;
		return this.wpcom.req.del( path, query, fn );
	}

	/**
	 * Restore post
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	restore( query, fn ) {
		return this.wpcom.req.put( `${this.getPostPath()}/restore`, query, null, fn );
	}

	/**
	 * Search within a site for related posts
	 *
	 * @param {Object} body - body object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	related( body, fn ) {
		return this.wpcom.req.put( `${this.getPostPath()}/related`, body, null, fn );
	}

	/**
	 * Create a `Comment` instance
	 *
	 * @param {String} [cid] - comment id
	 * @return {Comment} Comment instance
	 */
	comment( cid ) {
		return new Comment( cid, this._id, this._sid, this.wpcom );
	}

	/**
	 * Return recent comments
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	comments( query, fn ) {
		var comment = new Comment( null, this._id, this._sid, this.wpcom );
		return comment.replies( query, fn );
	}

	/**
	 * Create a `Like` instance
	 *
	 * @return {Like} Like instance
	 */
	like() {
		return new Like( this._id, this._sid, this.wpcom );
	}

	/**
	 * Create a `Reblog` instance
	 *
	 * @return {Reblog} Reblog instance
	 */
	reblog() {
		return new Reblog( this._id, this._sid, this.wpcom );
	}

	/**
	 * Return a `Subscriber` instance.
	 *
	 * *Example:*
	 *    // Create a Subscriber instance of a post
	 *    var post = wpcom.site( 'en.blog.wordpress.com' ).post( 1234 );
	 *    var subs = post.subscriber();
	 *
	 * @return {Subscriber} Subscriber instance
	 */
	subscriber() {
		return new Subscriber( this._id, this._sid, this.wpcom );
	};
}

// add methods in runtime
runtimeBuilder( SitePost, sitePostGetMethods, ( item, ctx ) => {
	return `/sites/${ctx._sid}/posts/${ctx._id}/${item.subpath}`;
} );

export default SitePost;
