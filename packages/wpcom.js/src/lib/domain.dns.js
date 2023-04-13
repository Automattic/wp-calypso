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
	 * @param {Object} record - record
	 * @param {Object} [query] - query object parameter
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
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	delete( record, query, fn ) {
		return this.wpcom.req.post( this._subpath + '/delete', query, record, fn );
	}

	/**
	 * Sets the default A records also deleting any A and AAAA custom records.
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @returns {Function} request handler
	 */
	setDefaultARecords( query, fn ) {
		return this.wpcom.req.post( this._subpath + '/set-default-a-records', query, null, fn );
	}
}

/**
 * Expose `DomainDns` module
 */
export default DomainDns;
