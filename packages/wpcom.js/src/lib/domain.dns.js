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

	/**
	 * Restores the default A records also deleting any A and AAAA custom records.
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @returns {Function} request handler
	 */
	restoreDefaultRecords( query, fn ) {
		query = query ?? { apiVersion: '1.3' };
		return this.wpcom.req.post( this._subpath + '/restore-default-records', query, null, fn );
	}
}

/**
 * Expose `DomainDns` module
 */
export default DomainDns;
