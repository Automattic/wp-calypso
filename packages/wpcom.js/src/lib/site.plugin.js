/**
 * Module vars
 */
const root = '/sites';

class SitePlugin {
	/**
	 * `SitePlugin` constructor.
	 *
	 * @param {string} [slug] - the plugin slug
	 * @param {number|string} sid - site identifier
	 * @param {WPCOM} wpcom - wpcom instance
	 * @returns {undefined} undefined
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

		const path = `${ root }/${ this._sid }/plugins`;
		this.pluginPath = `${ path }/${ this._slug }`;
	}

	/**
	 * Get informtion about the plugin
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @returns {Promise} Promise
	 */
	get( query, fn ) {
		return this.wpcom.req.get( this.pluginPath, query, fn );
	}

	/**
	 * Update the plugin configuration
	 *
	 * @param {object} [query] - query object parameter
	 * @param {object} body - plugin body object
	 * @param {Function} [fn] - callback function
	 * @returns {Promise} Promise
	 */
	update( query, body, fn ) {
		return this.wpcom.req.put( this.pluginPath, query, body, fn );
	}

	/**
	 * Update the plugin version
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @returns {Promise} Promise
	 */
	updateVersion( query, fn ) {
		return this.wpcom.req.put( `${ this.pluginPath }/update`, query, fn );
	}

	/**
	 * Install the plugin
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @returns {Promise} Promise
	 */
	install( query, fn ) {
		return this.wpcom.req.put( `${ this.pluginPath }/install`, query, fn );
	}

	/**
	 * Delete the plugin
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @returns {Promise} Promise
	 */
	delete( query, fn ) {
		return this.wpcom.req.put( `${ this.pluginPath }/delete`, query, fn );
	}

	/**
	 * Activate the plugin
	 * This method is a shorthand of update()
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @returns {Promise} Promise
	 */
	activate( query, fn ) {
		return this.update( query, { active: true }, fn );
	}

	/**
	 * Deactivate the plugin
	 * This method is a shorthand of update()
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @returns {Promise} Promise
	 */
	deactivate( query, fn ) {
		return this.update( query, { active: false }, fn );
	}

	/**
	 * Enable plugin autoupdate
	 * This method is a shorthand of update()
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @returns {Promise} Promise
	 */
	enableAutoupdate( query, fn ) {
		return this.update( query, { autoupdate: true }, fn );
	}

	/**
	 * Disable plugin autoupdate
	 * This method is a shorthand of update()
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @returns {Promise} Promise
	 */
	disableAutoupdate( query, fn ) {
		return this.update( query, { autoupdate: false }, fn );
	}
}

/**
 * Expose `SitePlugin` module
 */
export default SitePlugin;
