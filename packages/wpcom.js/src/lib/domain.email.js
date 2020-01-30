const root = '/domains/';

class DomainEmail {
	/**
	 * `DomainEmail` constructor.
	 *
	 * @param {String} [email] - email
	 * @param {String} domainId - domain identifier
	 * @param {WPCOM} wpcom - wpcom instance
	 * @return {Undefined} undefined
	 */
	constructor( email, domainId, wpcom ) {
		if ( ! ( this instanceof DomainEmail ) ) {
			return new DomainEmail( email, domainId, wpcom );
		}

		if ( email ) {
			this._email = email;
		}

		this._domain = domainId;
		this._subpath = root + this._domain + '/email/';
		this.wpcom = wpcom;
	}

	/**
	 * Update the email forwards/configuration for a domain.
	 *
	 * @param {String} destination - the email address to forward email to.
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	forward( destination, query, fn ) {
		let body = { destination: destination };
		return this.wpcom.req.post( this._subpath + this._email, query, body, fn );
	}

	/**
	 * Create an email forward for the domain
	 * if it has enough licenses.
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */

	add( mailbox, destination, query, fn ) {
		if ( 'function' === typeof query ) {
			fn = query;
			query = {};
		}

		let body = {
			mailbox: mailbox,
			destination: destination,
		};

		return this.wpcom.req.post( this._subpath + 'new', query, body, fn );
	}

	/**
	 * Delete an email forward for the domain
	 *
	 * @param {String} mailbox - mailbox to alter
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	delete( mailbox, query, fn ) {
		return this.wpcom.req.del( this._subpath + mailbox + '/delete', query, fn );
	}
}

/**
 * Expose `DomainEmail` module
 */
export default DomainEmail;
