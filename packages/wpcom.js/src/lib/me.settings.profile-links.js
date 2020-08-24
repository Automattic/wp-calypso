/**
 * Endpoint root
 */
const root = '/me/settings/profile-links';

/**
 * `ProfileLinks` constructor.
 *
 * @param {WPCOM} wpcom - wpcom instance
 * @returns {null} null
 */
export default function ProfileLinks( wpcom ) {
	if ( ! ( this instanceof ProfileLinks ) ) {
		return new ProfileLinks( wpcom );
	}

	this.wpcom = wpcom;
}

/**
 * Get profile links of the current user.
 *
 * *Example:*
 *   // Get profile links of the current user
 *    wpcom
 *    .me()
 *    .settings()
 *    .profileLinks()
 *    .get( function( err, data ) {
 *      // profile links data
 *    } );
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
ProfileLinks.prototype.get = function ( query, fn ) {
	return this.wpcom.req.get( root, query, fn );
};

// Create `mine` alias
ProfileLinks.prototype.mine = ProfileLinks.prototype.get;

/**
 * Add a profile link to current user.
 *
 * *Example:*
 *    // Add profile link to current user
 *    wpcom
 *    .me()
 *    .settings()
 *    .profileLinks()
 *    .add( {
 *      title: "WordPress Blog",
 *      value: "en.blog.wordpress.com"
 *    }, function( err, data ) {
 *      // profile has been added
 *    } );
 *
 * @param {Array|object} links - profile links
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
ProfileLinks.prototype.add = function ( links, query, fn ) {
	// query object is optional
	if ( 'function' === typeof query ) {
		fn = query;
		query = {};
	}

	// links can be Array or an Object
	if ( ! ( links instanceof Array ) ) {
		links = [ links ];
	}

	// Set api version 1.2 for this endpoint
	query.apiVersion = '1.2';

	let path = root + '/new';
	return this.wpcom.req.post( path, query, { links: links }, fn );
};

/**
 * Remove your ProfileLinks from a Post.
 *
 * *Example:*
 *    // Remove profile link from current user
 *    wpcom
 *    .me()
 *    .settings()
 *    .profileLinks()
 *    .del( 'example.wordpress.com', function( err, data ) {
 *      // profile has been deleted
 *    } );
 *
 * @param {string} slug - the URL of the profile link
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
ProfileLinks.prototype.del = function ( slug, query, fn ) {
	let path = root + '/' + slug + '/delete';
	return this.wpcom.req.del( path, query, fn );
};

// Create `delete` alias
ProfileLinks.prototype.delete = ProfileLinks.prototype.del;
