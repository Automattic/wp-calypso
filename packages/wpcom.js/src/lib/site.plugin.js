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
	 * Update the plugin version
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @return {Promise} Promise
	 */
	updateVersion( query, fn ) {
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

	/**
	 * Enable plugin autoupdate
	 * This method is a shorthand of update()
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @return {Promise} Promise
	 */
	enableAutoupdate( query, fn ) {
		return this.update( query, { autoupdate: true }, fn );
	}

	/**
	 * Disable plugin autoupdate
	 * This method is a shorthand of update()
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @return {Promise} Promise
	 */
	disableAutoupdate( query, fn ) {
		return this.update( query, { autoupdate: false }, fn );
	};
}

/**
 * Expose `SitePlugin` module
 */
export default SitePlugin;
