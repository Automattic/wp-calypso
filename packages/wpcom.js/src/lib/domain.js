import DomainDns from './domain.dns';
import DomainEmail from './domain.email';

const root = '/domains/';

class Domain {
	/**
	 * `Domain` constructor.
	 *
	 * @param {string} id - domain identifier
	 * @param wpcom - wpcom instance
	 * @returns {undefined} undefined
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
	 * @returns {Function} request handler
	 */
	status( query, fn ) {
		return this.wpcom.req.get( root + this._id + '/status', query, fn );
	}

	/**
	 * Check if the given domain is available
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
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
	 * @returns {Function} request handler
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
	 * @returns {Function} request handler
	 */
	canRedirect( siteId, query, fn ) {
		const path = root + siteId + '/' + this._id + '/can-redirect';
		return this.wpcom.req.get( path, query, fn );
	}

	/**
	 * Get the email forwards/configuration for a domain.
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	emailForwards( query, fn ) {
		return this.wpcom.req.get( root + this._id + '/email', query, fn );
	}

	/**
	 * Get a list of the nameservers for the domain
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	nameserversList( query, fn ) {
		return this.wpcom.req.get( root + this._id + '/nameservers', query, fn );
	}

	/**
	 * Update the nameservers for the domain
	 *
	 * @param {Array} nameservers - nameservers list
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	updateNameservers( nameservers, query, fn ) {
		const body = { nameservers: nameservers };
		return this.wpcom.req.post( root + this._id + '/nameservers', query, body, fn );
	}

	/**
	 * Get a list of the DNS records for the domain
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	dnsList( query, fn ) {
		return this.wpcom.req.get( root + this._id + '/dns', query, fn );
	}

	/**
	 * Get a list of all Google Apps accounts for the domain
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	googleAppsList( query, fn ) {
		return this.wpcom.req.get( root + this._id + '/google-apps', query, fn );
	}

	/**
	 * Resend the ICANN verification email for the domain
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	resendICANN( query, fn ) {
		return this.wpcom.req.post( root + this._id + '/resend-icann', query, fn );
	}

	/**
	 * Return `DomainEmail` instance
	 *
	 * @param {string} [email] - email identifier
	 * @returns {DomainEmail} DomainEmail instance
	 */
	email( email ) {
		return new DomainEmail( email, this._id, this.wpcom );
	}

	/**
	 * Return `DomainDns` instance
	 *
	 * @returns {DomainDns} DomainDns instance
	 */
	dns() {
		return new DomainDns( this._id, this.wpcom );
	}

	/**
	 * Gets info needed to provide mapping setup instructions for a domain.
	 *
	 * @param {string} siteId - site id the domain will be mapped to
	 * @param {object} query - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	mappingSetupInfo( siteId, query, fn ) {
		return this.wpcom.req.get( root + this._id + '/mapping-setup-info/' + siteId, query, fn );
	}

	/**
	 * Gets the mapping status for a domain.
	 *
	 * @param {object} query - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	mappingStatus( query, fn ) {
		return this.wpcom.req.get( root + this._id + '/mapping-status', query, fn );
	}

	/**
	 * Update the connection mode used to connect this domain and retrieve its mapping status.
	 *
	 * @param {string} mode - connection mode used to connect this domain (can be "suggested" or "advanced")
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	updateConnectionModeAndGetMappingStatus( mode, query, fn ) {
		const body = { mode };
		return this.wpcom.req.post( root + this._id + '/mapping-status', query, body, fn );
	}
}

/**
 * Expose `Domain` module
 */
export default Domain;
