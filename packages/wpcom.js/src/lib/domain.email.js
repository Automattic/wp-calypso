const root = '/domains/';

class DomainEmail {
	/**
	 * `DomainEmail` constructor.
	 *
	 * @param {string} [email] - email
	 * @param {string} domainId - domain identifier
	 * @param {WPCOM} wpcom - wpcom instance
	 * @returns {undefined} undefined
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
	 * @param {string} destination - the email address to forward email to.
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	forward( destination, query, fn ) {
		let body = { destination: destination };
		return this.wpcom.req.post( this._subpath + this._email, query, body, fn );
	}

	/**
	 * Create an email forward for the domain
	 * if it has enough licenses.
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
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
	 * @param {string} mailbox - mailbox to alter
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	delete( mailbox, query, fn ) {
		return this.wpcom.req.del( this._subpath + mailbox + '/delete', query, fn );
	}
}

/**
 * Expose `DomainEmail` module
 */
export default DomainEmail;
