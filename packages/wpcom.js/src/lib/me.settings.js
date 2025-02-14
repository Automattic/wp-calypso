/**
 * `MeSettings` constructor.
 *
 * Use a `WPCOM#Me` instance to create a new `MeSettings` instance.
 * @param {WPCOM} wpcom - wpcom instance
 * @returns {MeSettings|undefined}
 */
export default function MeSettings( wpcom ) {
	if ( ! ( this instanceof MeSettings ) ) {
		return new MeSettings( wpcom );
	}

	this.wpcom = wpcom;
}

/**
 * Get settings for the current user.
 *
 * Example:
 * // Get settings for the current user
 * wpcom
 * .me()
 * .settings()
 * .get( function( err, data ) {
 * // user settings data object
 * } );
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
MeSettings.prototype.get = function ( query, fn ) {
	return this.wpcom.req.get( '/me/settings', query, fn );
};

/**
 * Update settings of the current user
 * @param {Object} [query] - query object parameter
 * @param {Object} body - body object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
MeSettings.prototype.update = function ( query, body, fn ) {
	return this.wpcom.req.put( '/me/settings/', query, body, fn );
};
