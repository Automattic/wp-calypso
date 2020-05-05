const root = '/me/publicize-connections/';

export default class PublicizeConnection {
	/**
	 * `PublicizeConnection` constructor.
	 *
	 * @param {string} connectionId - application identifier
	 * @param {WPCOM} wpcom - wpcom instance
	 * @returns {null} null
	 */
	constructor( connectionId, wpcom ) {
		if ( ! ( this instanceof PublicizeConnection ) ) {
			return new PublicizeConnection( connectionId, wpcom );
		}
		this._id = connectionId;
		this.wpcom = wpcom;
	}

	/**
	 * Get a single publicize connection that the current user has set up.
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	get( query, fn ) {
		return this.wpcom.req.get( root + this._id, query, fn );
	}

	/**
	 * Add a publicize connection belonging to the current user.
	 *
	 * @param {object} [query] - query object parameter
	 * @param {object} body - body object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	add( query, body, fn ) {
		return this.wpcom.req.post( root + 'new', query, body, fn );
	}

	/**
	 * Update a publicize connection belonging to the current user.
	 *
	 * @param {object} [query] - query object parameter
	 * @param {object} body - body object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	update( query, body, fn ) {
		return this.wpcom.req.put( root + this._id, query, body, fn );
	}

	/**
	 * Delete the app of the  current user
	 * through of the given connectionId
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	delete( query, fn ) {
		return this.wpcom.req.del( root + this._id + '/delete', query, fn );
	}
}
