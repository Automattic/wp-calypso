/**
 * Module variables
 */
const root = '/sites';

class SitePlugin {
	/**
	 * `SitePlugin` constructor.
	 *
	 * @param {String} [id] - the plugin ID
	 * @param {Number|String} sid - site identifier
	 * @param {WPCOM} wpcom - wpcom instance
	 * @return {Undefined} undefined
	 */
	constructor( id, sid, wpcom ) {
		if ( ! ( this instanceof SitePlugin ) ) {
			return new SitePlugin( id, sid, wpcom );
		}

		this._id = id;
		this._sid = sid;
		this.path = `${root}/${this._sid}/plugins`;
		this.wpcom = wpcom;
	}

	/**
	 * Get informtion about the plugin
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} [fn] - callback function
	 * @return {Function} request handler
	 */
	get( query, fn ) {
		return this.wpcom.req.get( `${this.path}/${this._id}`, query, fn );
	}
}

/**
 * Expose `SitePlugin` module
 */
export default SitePlugin;
