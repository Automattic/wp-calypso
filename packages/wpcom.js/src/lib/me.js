import MeSettings from './me.settings';

/**
 * Create `Me` instance
 * @param {Object} wpcom - wpcom instance
 * @returns {undefined|Me} New Me instance or undefined.
 */
export default function Me( wpcom ) {
	if ( ! ( this instanceof Me ) ) {
		return new Me( wpcom );
	}

	this.wpcom = wpcom;
}

/**
 * Meta data about auth token's User
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Me.prototype.get = function ( query, fn ) {
	return this.wpcom.req.get( '/me', query, fn );
};

/**
 * Get a list of posts of from the user's blogs
 *
 * Example:
 * // Get posts list
 * wpcom
 * .me()
 * .postsList( function( err, data ) {
 * // posts list data object
 * } );
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Me.prototype.postsList = function ( query, fn ) {
	return this.wpcom.req.get( '/me/posts', query, fn );
};

/**
 * A list of the current user's sites
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Me.prototype.sites = function ( query, fn ) {
	return this.wpcom.req.get( '/me/sites', query, fn );
};

/**
 * Return a `MeSettings` instance.
 * @returns {MeSettings} MeSettings instance
 */
Me.prototype.settings = function () {
	return new MeSettings( this.wpcom );
};
