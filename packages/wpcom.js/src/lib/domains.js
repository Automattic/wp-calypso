const root = '/domains/';

class Domains {
	/**
	 * `Domains` constructor.
	 *
	 * @param {WPCOM} wpcom - wpcom instance
	 * @returns {undefined} undefined
	 */
	constructor( wpcom ) {
		if ( ! ( this instanceof Domains ) ) {
			return new Domains( wpcom );
		}
		this.wpcom = wpcom;
	}

	/**
	 * Get a list of suggested domain names that are available for
	 * registration based on a given term or domain name.
	 *
	 * @param {string|object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	suggestions( query, fn ) {
		if ( 'string' === typeof query ) {
			query = { query: query };
		}
		return this.wpcom.req.get( root + 'suggestions', query, fn );
	}

	/**
	 * GET example domain suggestions
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	suggestionsExamples( query, fn ) {
		return this.wpcom.req.get( root + 'suggestions/examples', query, fn );
	}

	/**
	 * Get a localized list of supported countries for domain registrations.
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	supportedCountries( query, fn ) {
		return this.wpcom.req.get( root + 'supported-countries', query, fn );
	}

	/**
	 * Get a localized list of supported states for domain registrations.
	 *
	 * @param {string} countryCode - country code ISO 3166-1 alpha-2 identifier
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	supportedStates( countryCode, query, fn ) {
		var path = root + 'supported-states/' + countryCode;
		return this.wpcom.req.get( path, query, fn );
	}
}

/**
 * Expose `Domains` module
 */
export default Domains;
