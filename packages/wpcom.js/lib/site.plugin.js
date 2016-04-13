/**
 * Module vars
 */
const root = '/sites';

class SitePlugin {

	/**
	 * `SitePlugin` constructor.
	 *
	 * @param {String} [slug] - the plugin slug
	 * @param {Number|String} sid - site identifier
	 * @param {WPCOM} wpcom - wpcom instance
	 * @return {Undefined} undefined
	 */
	constructor( slug, sid, wpcom ) {
		if ( ! ( this instanceof SitePlugin ) ) {
			return new SitePlugin( slug, sid, wpcom );
		}

		if ( ! slug ) {
			throw new Error( '`slug` is not correctly defined' );
		}

		this._slug = encodeURIComponent( slug );
		this._sid = sid;
		this.wpcom = wpcom;

		const path = `${root}/${ this._sid }/plugins`;
		this.pluginPath = `${ path }/${ this._slug }`;
	}

	/**
	 * Get informtion about the plugin
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @return {Promise} Promise
	 */
	get( query, fn ) {
		return this.wpcom.req.get( this.pluginPath, query, fn );
	}

	/**
	 * config the plugin
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Object} config - plugin config object
	 * @param {Function} [fn] - callback function
	 * @return {Promise} Promise
	 */
	config( query, config, fn ) {
		return this.wpcom.req.put( this.pluginPath, query, config, fn );
	};

	/**
	 * Update the plugin
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @return {Promise} Promise
	 */
	update( query, fn ) {
		return this.wpcom.req.put( `${ this.pluginPath }/update`, query, fn );
	};

	/**
	 * Install the plugin
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @return {Promise} Promise
	 */
	install( query, fn ) {
		return this.wpcom.req.put( `${ this.pluginPath }/install`, query, fn );
	};

	/**
	 * Delete the plugin
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @return {Promise} Promise
	 */
	delete( query, fn ) {
		return this.wpcom.req.put( `${ this.pluginPath }/delete`, query, fn );
	};

	/**
	 * Activate the plugin
	 * This method is a shorthand of config()
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @return {Promise} Promise
	 */
	activate( query, fn ) {
		return this.config( query, { active: true }, fn );
	};

	/**
	 * Deactivate the plugin
	 * This method is a shorthand of config()
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @return {Promise} Promise
	 */
	deactivate( query, fn ) {
		return this.config( query, { active: false }, fn );
	}

	/**
	 * Enable plugin autoupdate
	 * This method is a shorthand of config()
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @return {Promise} Promise
	 */
	enableAutoupdate( query, fn ) {
		return this.config( query, { autoupdate: true }, fn );
	}

	/**
	 * Disable plugin autoupdate
	 * This method is a shorthand of config()
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @return {Promise} Promise
	 */
	disableAutoupdate( query, fn ) {
		return this.config( query, { autoupdate: false }, fn );
	};
}

/**
 * Expose `SitePlugin` module
 */
export default SitePlugin;
