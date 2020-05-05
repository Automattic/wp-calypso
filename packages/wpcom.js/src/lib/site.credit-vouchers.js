/**
 * SiteCreditVouchers methods
 *
 * @param {string} sid - site id
 * @param {WPCOM} wpcom - wpcom instance
 * @returns {null} null
 */
class SiteCreditVouchers {
	constructor( sid, wpcom ) {
		if ( ! sid ) {
			throw new Error( '`site id` is not correctly defined' );
		}

		if ( ! ( this instanceof SiteCreditVouchers ) ) {
			return new SiteCreditVouchers( sid, wpcom );
		}

		this.wpcom = wpcom;
		this._sid = sid;
		this.path = `/sites/${ this._sid }/vouchers`;
	}

	/**
	 * Get site vouchers list
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	list( query = {}, fn ) {
		query.apiNamespace = 'wpcom/v2';
		return this.wpcom.req.get( this.path, query, fn );
	}

	/**
	 * Get site voucher
	 *
	 * @param {string} serviceType - service type
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	get( serviceType, query = {}, fn ) {
		query.apiNamespace = 'wpcom/v2';
		return this.wpcom.req.get( `${ this.path }/${ serviceType }`, query, fn );
	}

	/**
	 * Assign a new voucher to the site
	 *
	 * @param {string} serviceType - service type
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	assign( serviceType, query = {}, fn ) {
		query.apiNamespace = 'wpcom/v2';
		return this.wpcom.req.post( `${ this.path }/${ serviceType }/assign`, query, {}, fn );
	}
}

export default SiteCreditVouchers;
