/**
 * Module dependencies
 */
import DomainEmail from './domain.email';
import DomainDns from './domain.dns';

const root = '/domains/';

class Domain {
	/**
	 * `Domain` constructor.
	 *
	 * @param {string} id - domain identifier
	 * @param {WPCOM} wpcom - wpcom instance
	 * @return {undefined} undefined
	 */
	constructor( id, wpcom ) {
		if ( ! ( this instanceof Domain ) ) {
			return new Domain( id, wpcom );
		}
		this._id = id;
		this.wpcom = wpcom;
	}

	/**
	 * Get the status of the domain
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	status( query, fn ) {
		return this.wpcom.req.get( root + this._id + '/status', query, fn );
	}

	/**
	 * Check if the given domain is available
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	isAvailable( query, fn ) {
		return this.wpcom.req.get( root + this._id + '/is-available', query, fn );
	}

	/**
	 * Check if the given domain name can be mapped to
	 * a WordPress blog.
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	isMappable( query, fn ) {
		return this.wpcom.req.get( root + this._id + '/is-mappable', query, fn );
	}

	/**
	 * Check if the given domain name can be used for site redirect.
	 *
	 * @param {string} siteId - site id of the site to check
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	canRedirect( siteId, query, fn ) {
		var path = root + siteId + '/' + this._id + '/can-redirect';
		return this.wpcom.req.get( path, query, fn );
	}

	/**
	 * Get the email forwards/configuration for a domain.
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	emailForwards( query, fn ) {
		return this.wpcom.req.get( root + this._id + '/email', query, fn );
	}

	/**
	 * Get a list of the nameservers for the domain
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	nameserversList( query, fn ) {
		return this.wpcom.req.get( root + this._id + '/nameservers', query, fn );
	}

	/**
	 * Update the nameservers for the domain
	 *
	 * @param {Array} nameservers- nameservers list
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	updateNameservers( nameservers, query, fn ) {
		let body = { nameservers: nameservers };
		return this.wpcom.req.post( root + this._id + '/nameservers', query, body, fn );
	}

	/**
	 * Get a list of the DNS records for the domain
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	dnsList( query, fn ) {
		return this.wpcom.req.get( root + this._id + '/dns', query, fn );
	}

	/**
	 * Get a list of all Google Apps accounts for the domain
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	googleAppsList( query, fn ) {
		return this.wpcom.req.get( root + this._id + '/google-apps', query, fn );
	}

	/**
	 * Resend the ICANN verification email for the domain
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	resendICANN( query, fn ) {
		return this.wpcom.req.post( root + this._id + '/resend-icann', query, fn );
	}

	/**
	 * Return `DomainEmail` instance
	 *
	 * @param {string} [email] - email identifier
	 * @return {DomainEmail} DomainEmail instance
	 */
	email( email ) {
		return new DomainEmail( email, this._id, this.wpcom );
	}

	/**
	 * Return `DomainDns` instance
	 *
	 * @return {DomainDns} DomainDns instance
	 */
	dns() {
		return new DomainDns( this._id, this.wpcom );
	}
}

/**
 * Expose `Domain` module
 */
export default Domain;
