/**
 * Module dependencies.
 */
import SiteTaxonomyTerm from './site.taxonomy.term';

/**
 * SiteTaxonomy class
 */
class SiteTaxonomy {
	/**
	 * Create a SiteTaxonomy instance
	 *
	 * @param {string} taxonomy - taxonomy type
	 * @param {string} siteId - site id
	 * @param {WPCOM} wpcom - wpcom instance
	 * @returns {null} null
	 */
	constructor( taxonomy, siteId, wpcom ) {
		if ( ! siteId ) {
			throw new TypeError( '`siteId` is not correctly defined' );
		}

		if ( ! taxonomy ) {
			throw new TypeError( '`taxonomy` is not correctly defined' );
		}

		if ( ! ( this instanceof SiteTaxonomy ) ) {
			return new SiteTaxonomy( taxonomy, siteId, wpcom );
		}

		this.wpcom = wpcom;

		this._siteId = encodeURIComponent( siteId );
		this._taxonomy = encodeURIComponent( taxonomy );
		this._rootPath = `/sites/${ this._siteId }/taxonomies/${ this._taxonomy }`;
	}

	/**
	 * Get a list of Terms for the Taxonomy
	 *
	 * @param {object} [query] - query object
	 * @param {Function} fn - callback function
	 * @returns {Promise} Promise
	 */
	termsList( query, fn ) {
		const termsPath = `${ this._rootPath }/terms`;
		return this.wpcom.req.get( termsPath, query, fn );
	}

	/**
	 * Return `Term` instance
	 *
	 * @param {string} [term] - term slug
	 * @returns {Term} Term instance
	 */
	term( term ) {
		return new SiteTaxonomyTerm( term, this._taxonomy, this._siteId, this.wpcom );
	}
}

export default SiteTaxonomy;
