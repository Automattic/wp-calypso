/**
 * SitePostType class
 */
export default class SitePostType {
	/**
	 * Create a SitePostType instance
	 *
	 * @param {String} postType - post type
	 * @param {String} siteId - site id
	 * @param {WPCOM} wpcom - wpcom instance
	 * @return {Null} null
	 */
	constructor( postType, siteId, wpcom ) {
		if ( ! siteId ) {
			throw new TypeError( '`siteId` is not correctly defined' );
		}

		if ( ! postType ) {
			throw new TypeError( '`postType` is not correctly defined' );
		}

		if ( ! ( this instanceof SitePostType ) ) {
			return new SitePostType( postType, siteId, wpcom );
		}

		this.wpcom = wpcom;

		this._siteId = encodeURIComponent( siteId );
		this._postType = encodeURIComponent( postType );
		this._rootPath = `/sites/${ this._siteId }/post-types/${ this._postType }`;
	}

	/**
	 * Get a list of taxonomies for the post type
	 *
	 * @param {Object} query - query object
	 * @param {Function} fn - callback function
	 * @return {Promise} Promise
	 */
	taxonomiesList( query, fn ) {
		const termsPath = `${ this._rootPath }/taxonomies`;
		return this.wpcom.req.get( termsPath, query, fn );
	}
}
