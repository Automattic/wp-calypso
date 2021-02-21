class SitePostSubscriber {
	/**
	 * `SitePostSubscriber` constructor.
	 *
	 * @param {string} id - post identifier
	 * @param {string} sid - site identifier
	 * @param {WPCOM} wpcom - wpcom instance
	 * @returns {null} null
	 */
	constructor( id, sid, wpcom ) {
		if ( ! sid ) {
			throw new Error( '`side id` is not correctly defined' );
		}

		if ( ! id ) {
			throw new Error( '`post id` is not correctly defined' );
		}

		if ( ! ( this instanceof SitePostSubscriber ) ) {
			return new SitePostSubscriber( id, sid, wpcom );
		}

		this.wpcom = wpcom;
		this._id = id;
		this._sid = sid;
		this.path = `/sites/${ this._sid }/posts/${ this._id }/subscribers`;
	}

	/**
	 * Get subscriber status for the current user for the Post.
	 *
	 *
	 * *Example:*
	 *    Get subscriber status for the current user for the Post
	 *    wpcom
	 *    .site( 'en.blog.wordpress.com' )
	 *    .post( 1234 )
	 *    .subscriber()
	 *    .mine( function( err, data ) {
	 *      // subscription data
	 *    } );
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Promise} Promise
	 */
	mine( query, fn ) {
		return this.wpcom.req.get( `${ this.path }/mine`, query, fn );
	}

	/**
	 * Subscribe the current user to the post.
	 *
	 * *Example:*
	 *    // Subscribe the current user to the post
	 *    wpcom
	 *    .site( 'en.blog.wordpress.com' )
	 *    .post( 1234 )
	 *    .subscriber()
	 *    .add( function( err, data ) {
	 *      // current user has been subscribed to post
	 *    } );
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Promise} Promise
	 */
	add( query, fn ) {
		return this.wpcom.req.put( `${ this.path }/new`, query, null, fn );
	}

	/**
	 * Unsubscribe current user to the post
	 *
	 * *Example:*
	 *    // Unsubscribe current user to the post
	 *    wpcom
	 *    .site( 'en.blog.wordpress.com' )
	 *    .post( 1234 )
	 *    .subscriber()
	 *    .del( function( err, data ) {
	 *      // current user has been unsubscribed to post
	 *    } );
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Promise} Promise
	 */
	del( query, fn ) {
		return this.wpcom.req.del( `${ this.path }/mine/delete`, query, fn );
	}
}

// method alias
SitePostSubscriber.prototype.state = SitePostSubscriber.prototype.mine;
SitePostSubscriber.prototype.delete = SitePostSubscriber.prototype.del;

export default SitePostSubscriber;
