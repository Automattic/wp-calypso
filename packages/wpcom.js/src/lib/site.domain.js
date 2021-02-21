/**
 * Module vars
 */
const root = '/sites';

class SiteDomain {
	/**
	 * `SiteDomain` constructor.
	 *
	 * @param {number|string} id - site identifier
	 * @param {WPCOM} wpcom - wpcom instance
	 * @returns {undefined} undefined
	 */
	constructor( id, wpcom ) {
		if ( ! ( this instanceof SiteDomain ) ) {
			return new SiteDomain( id, wpcom );
		}
		this._sid = id;
		this.path = `${ root }/${ this._sid }/domains`;
		this.wpcom = wpcom;
	}

	/**
	 * Get the primary domain for a site
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @returns {Function} request handler
	 */
	getPrimary( query, fn ) {
		return this.wpcom.req.get( `${ this.path }/primary`, query, fn );
	}

	/**
	 * Set the primary domain for a site
	 *
	 * @param {string} domain - domain to set
	 * @param {Function} [fn] - callback function
	 * @returns {Function} request handler
	 */
	setPrimary( domain, fn ) {
		return this.wpcom.req.put( `${ this.path }/primary`, {}, { domain }, fn );
	}

	/**
	 * Get the redirect status for a site
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @returns {Function} request handler
	 */
	getRedirect( query, fn ) {
		return this.wpcom.req.get( `${ this.path }/redirect`, query, fn );
	}

	/**
	 * Set the redirect location for a site
	 *
	 * @param {string|object} location - location to set
	 * @param {Function} [fn] - callback function
	 * @returns {Function} request handler
	 */
	setRedirect( location, fn ) {
		if ( typeof location === 'string' ) {
			location = { location };
		}

		return this.wpcom.req.put( `${ this.path }/redirect`, {}, location, fn );
	}
}

/**
 * Expose `SiteDomain` module
 */
export default SiteDomain;
