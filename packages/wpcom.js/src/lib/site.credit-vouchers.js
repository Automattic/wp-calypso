/**
 * SiteCreditVouchers methods
 *
 * @param {String} sid - site id
 * @param {WPCOM} wpcom - wpcom instance
 * @return {Null} null
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
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	list( query = {}, fn ) {
		query.apiNamespace = 'wpcom/v2';
		return this.wpcom.req.get( this.path, query, fn );
	}

	/**
	 * Get site voucher
	 *
	 * @param {String} serviceType - service type
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	get( serviceType, query = {}, fn ) {
		query.apiNamespace = 'wpcom/v2';
		return this.wpcom.req.get( `${ this.path }/${ serviceType }`, query, fn );
	}

	/**
	 * Assign a new voucher to the site
	 *
	 * @param {String} serviceType - service type
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	assign( serviceType, query = {}, fn ) {
		query.apiNamespace = 'wpcom/v2';
		return this.wpcom.req.post( `${ this.path }/${ serviceType }/assign`, query, {}, fn );
	}
}

export default SiteCreditVouchers;
