const root = '/me/connected-applications/';

export default class MeConnectedApp {

	/**
	 * `MeConnectedApp` constructor.
	 *
	 * @param {String} appId - application identifier
	 * @param {WPCOM} wpcom - wpcom instance
	 * @return {Null} null
	 */
	constructor( appId, wpcom ) {
		if ( ! ( this instanceof MeConnectedApp ) ) {
			return new MeConnectedApp( appId, wpcom );
		}
		this._id = appId;
		this.wpcom = wpcom;
	}

	/**
	 * Get one of current user's connected applications.
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	get( query, fn ) {
		return this.wpcom.req.get( root + this._id, query, fn );
	}

	/**
	 * Delete the app of the  current user
	 * through of the given appId
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	delete( query, fn ) {
		return this.wpcom.req.del( root + this._id + '/delete', query, fn );
	}
}
