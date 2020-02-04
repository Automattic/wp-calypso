const root = '/plans';

export default class Plans {
	/**
	 * `Plans` constructor.
	 *
	 * @param {WPCOM} wpcom - wpcom instance
	 * @return {undefined} undefined
	 */
	constructor( wpcom ) {
		if ( ! ( this instanceof Plans ) ) {
			return new Plans( wpcom );
		}
		this.wpcom = wpcom;
	}

	/**
	 * Get a list of active WordPress.com plans
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @return {Promise} Promise
	 */
	list( query, fn ) {
		return this.wpcom.req.get( root, query, fn );
	}

	/**
	 * Get a list of features for active WordPress.com plans
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @return {Promise} Promise
	 */
	features( query, fn ) {
		return this.wpcom.req.get( `${ root }/features`, query, fn );
	}
}
