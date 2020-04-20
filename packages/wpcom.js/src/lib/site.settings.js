/**
 * SiteSettings methods
 *
 * @param {string} sid - site id
 * @param {WPCOM} wpcom - wpcom instance
 * @returns {null} null
 */
class SiteSettings {
	constructor( sid, wpcom ) {
		if ( ! sid ) {
			throw new Error( '`site id` is not correctly defined' );
		}

		if ( ! ( this instanceof SiteSettings ) ) {
			return new SiteSettings( sid, wpcom );
		}

		this.wpcom = wpcom;
		this._sid = sid;
		this.path = `/sites/${ this._sid }/settings`;
	}

	/**
	 * Get site-settings
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	get( query, fn ) {
		return this.wpcom.req.get( this.path, query, fn );
	}

	/**
	 * Get site-settings single option
	 *
	 * @param {string} option - option to ask
	 * @param {Function} [fn] - callback function
	 * @returns {Function} request handler
	 */
	getOption( option, fn = () => {} ) {
		let query = { fields: 'settings' };
		return new Promise( ( resolve, reject ) => {
			this.wpcom.req.get( this.path, query, ( err, data ) => {
				if ( err ) {
					fn( err );
					return reject( err );
				}

				if ( ! data ) {
					fn();
					return resolve();
				}

				let settings = data.settings;

				if ( settings && typeof settings[ option ] !== 'undefined' ) {
					fn( null, settings[ option ] );
					return resolve( settings[ option ] );
				}

				fn( null, data );
				return resolve( data );
			} );
		} );
	}

	/**
	 * Update site-settings
	 *
	 * @param {object} [query] - query object parameter
	 * @param {object} body - body object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	update( query, body, fn ) {
		return this.wpcom.req.put( this.path, query, body, fn );
	}

	/**
	 * Set site-settings single option
	 *
	 * @param {string} option - option to set
	 * @param {*} value - value to assing to the given option
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	setOption( option, value, fn ) {
		return this.wpcom.req.put( this.path, {}, { [ option ]: value }, fn );
	}
}

export default SiteSettings;
