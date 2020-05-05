const root = '/me/keyring-connections/';

export default class KeyringConnection {
	/**
	 * `KeyringConnection` constructor.
	 *
	 * @param {string} keyId - the connection ID to take action on.
	 * @param {WPCOM} wpcom - wpcom instance
	 * @returns {null} null
	 */
	constructor( keyId, wpcom ) {
		if ( ! ( this instanceof KeyringConnection ) ) {
			return new KeyringConnection( keyId, wpcom );
		}
		this._id = keyId;
		this.wpcom = wpcom;
	}

	/**
	 * Get a single Keyring connection that the current user has setup.
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	get( query, fn ) {
		return this.wpcom.req.get( root + this._id, query, fn );
	}

	/**
	 * Delete the Keyring connection (and associated token) with the
	 * provided ID. Also deletes all associated publicize connections.
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	delete( query, fn ) {
		return this.wpcom.req.del( root + this._id + '/delete', query, fn );
	}
}
