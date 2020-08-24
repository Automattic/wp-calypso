/**
 * Module dependencies
 */
import MeProfileLinks from './me.settings.profile-links';
import MeSettingsPassword from './me.settings.password';

/**
 * `MeSettings` constructor.
 *
 * Use a `WPCOM#Me` instance to create a new `MeSettings` instance.
 *
 * @param {WPCOM} wpcom - wpcom instance
 * @returns {null} null
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
 * *Example:*
 *    // Get settings for the current user
 *    wpcom
 *    .me()
 *    .settings()
 *    .get( function( err, data ) {
 *      // user settings data object
 *    } );
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
MeSettings.prototype.get = function ( query, fn ) {
	return this.wpcom.req.get( '/me/settings', query, fn );
};

/**
 * Update settings of the current user
 *
 * @param {object} [query] - query object parameter
 * @param {object} body - body object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
MeSettings.prototype.update = function ( query, body, fn ) {
	return this.wpcom.req.put( '/me/settings/', query, body, fn );
};

/**
 * Return `MeProfileLinks` instance
 *
 * *Example:*
 *    // Create a MeProfileLinks instance
 *    var profile_links = wpcom.me().settings().profileLinks();
 *
 * @returns {MeProfileLinks} MeProfileLinks instance
 */
MeSettings.prototype.profileLinks = function () {
	return new MeProfileLinks( this.wpcom );
};

/**
 * Return `MeSettingsPassword` instance
 *
 * @returns {MeSettingsPassword} MeSettingsPassword instance
 */
MeSettings.prototype.password = function () {
	return new MeSettingsPassword( this.wpcom );
};
