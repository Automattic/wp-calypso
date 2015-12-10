const root = '/me/settings/password/';

class MeSettingsPassword {

	/**
	 * `MeSettingsPassword` constructor.
	 *
	 * @param {WPCOM} wpcom - wpcom instance
	 * @return {Null} null
	 */
	constructor( wpcom ) {
		if ( ! ( this instanceof MeSettingsPassword ) ) {
			return new MeSettingsPassword( wpcom );
		}
		this.wpcom = wpcom;
	}

	/**
	 * Verify strength of a user's new password.
	 *
	 * @param {String} password - the users's potential new password
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	validate( password, query, fn ) {
		return this.wpcom.req.post( root + 'validate', query, { password: password }, fn );
	}
}

/**
* Expose `MeSettingsPassword` module
*/
module.exports = MeSettingsPassword;
