/**
 * Module vars
 */
const root = '/sites';

class SiteWPComPlugin {

	/**
	 * `SiteWPComPlugin` constructor.
	 *
	 * @param {String} [slug] - the plugin slug
	 * @param {Number|String} sid - site identifier
	 * @param {WPCOM} wpcom - wpcom instance
	 * @return {Undefined} undefined
	 */
	constructor( slug, sid, wpcom ) {
		if ( ! ( this instanceof SiteWPComPlugin ) ) {
			return new SiteWPComPlugin( slug, sid, wpcom );
		}

		if ( ! slug ) {
			throw new Error( '`slug` is not correctly defined' );
		}

		this._slug = encodeURIComponent( slug );
		this._sid = sid;
		this.wpcom = wpcom;

		const path = `${root}/${ this._sid }/wpcom-plugins`;
		this.pluginPath = `${ path }/${ this._slug }`;
	}

	/**
	 * Update the plugin configuration
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Object} body - plugin body object
	 * @param {Function} [fn] - callback function
	 * @return {Promise} Promise
	 */
	update( query, body, fn ) {
		return this.wpcom.req.put( this.pluginPath, query, body, fn );
	};

	/**
	 * Activate the plugin
	 * This method is a shorthand of update()
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @return {Promise} Promise
	 */
	activate( query, fn ) {
		return this.update( query, { active: true }, fn );
	};

	/**
	 * Deactivate the plugin
	 * This method is a shorthand of update()
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @return {Promise} Promise
	 */
	deactivate( query, fn ) {
		return this.update( query, { active: false }, fn );
	}
}

/**
 * Expose `SiteWPComPlugin` module
 */
export default SiteWPComPlugin;
