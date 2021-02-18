const root = '/domains/';

class DomainDns {
	/**
	 * `DomainDns` constructor.
	 *
	 * @param {string} domainId - domain identifier
	 * @param {WPCOM} wpcom - wpcom instance
	 * @returns {undefined} undefined
	 */
	constructor( domainId, wpcom ) {
		if ( ! ( this instanceof DomainDns ) ) {
			return new DomainDns( domainId, wpcom );
		}

		this._domain = domainId;
		this._subpath = root + this._domain + '/dns';
		this.wpcom = wpcom;
	}

	/**
	 * Adds a DNS record
	 *
	 * @param {object} record - record
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	add( record, query, fn ) {
		if ( 'function' === typeof query ) {
			fn = query;
			query = {};
		}

		return this.wpcom.req.post( this._subpath + '/add', query, record, fn );
	}

	/**
	 * Delete a DNS record
	 *
	 * @param {string} record - record
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	delete( record, query, fn ) {
		return this.wpcom.req.post( this._subpath + '/delete', query, record, fn );
	}
}

/**
 * Expose `DomainDns` module
 */
export default DomainDns;
