const root = '/me/settings/password/';

export default class MeSettingsPassword {
	/**
	 * `MeSettingsPassword` constructor.
	 *
	 * @param {WPCOM} wpcom - wpcom instance
	 * @returns {null} null
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
	 * @param {string} password - the users's potential new password
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	validate( password, query, fn ) {
		return this.wpcom.req.post( root + 'validate', query, { password: password }, fn );
	}
}
