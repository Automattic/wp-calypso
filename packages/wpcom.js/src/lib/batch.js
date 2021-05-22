class Batch {
	/**
	 * Create a `Batch` instance
	 *
	 * @param {WPCOM} wpcom - wpcom instance
	 * @returns {null} null
	 */
	constructor( wpcom ) {
		if ( ! ( this instanceof Batch ) ) {
			return new Batch( wpcom );
		}

		this.wpcom = wpcom;
		this.urls = [];
	}

	/**
	 * Add url to batch requests
	 *
	 * @param {string} url - endpoint url
	 * @returns {Batch} batch instance
	 */
	add( url ) {
		this.urls.push( url );
		return this;
	}

	/**
	 * Run the batch request
	 *
	 * @param {object} [query] - optional query parameter
	 * @param {Function} fn - callback
	 * @returns {Promise} Promise
	 */
	run( query = {}, fn ) {
		if ( 'function' === typeof query ) {
			fn = query;
			query = {};
		}

		// add urls to query object
		query.urls = this.urls;

		return this.wpcom.req.get( '/batch', query, fn );
	}
}

/**
 * Expose `Batch` module
 */
export default Batch;
