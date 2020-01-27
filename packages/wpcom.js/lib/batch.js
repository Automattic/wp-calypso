class Batch {
	/**
	 * Create a `Batch` instance
	 *
	 * @param {WPCOM} wpcom - wpcom instance
	 * @return {null} null
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
	 * @param {String} url - endpoint url
	 * @return {Batch} batch instance
	 */
	add( url ) {
		this.urls.push( url );
		return this;
	}

	/**
	 * Run the batch request
	 *
	 * @param {Object} [query] - optional query parameter
	 * @param {Function} fn - callback
	 * @return {Promise} Promise
	 */
	run( query = {}, fn ) {
		if ( 'function' === typeof query ) {
			fn = query;
			query = {}
		}

		// add urls to query object
		query.urls = this.urls;

		return this.wpcom.req.get( '/batch', query, fn );
	}
};

/**
 * Expose `Batch` module
 */
export default Batch;
