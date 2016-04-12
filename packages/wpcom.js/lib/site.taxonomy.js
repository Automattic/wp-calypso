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
	 * @param {String} taxonomy - taxonomy type
	 * @param {String} siteId - site id
	 * @param {WPCOM} wpcom - wpcom instance
	 * @return {Null} null
	 */
	constructor( taxonomy, siteId, wpcom ) {
		if ( ! siteId ) {
			throw new Error( '`siteId` is not correctly defined' );
		}

		if ( ! taxonomy ) {
			throw new Error( '`taxonomy` is not correctly defined' );
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
	 * @param {Object} [query] - query object
 	 * @param {Function} fn - callback function
 	 * @return {Promise} Promise
 	 */
	termsList( query, fn ) {
		const termsPath = `${ this._rootPath }/terms`;
		return this.wpcom.req.get( termsPath, query, fn );
	}

	/**
	 * Return `Term` instance
	 *
	 * @param {String} [term] - term slug
	 * @return {Term} Term instance
	 */
	term( term ) {
		return new SiteTaxonomyTerm( term, this._taxonomy, this._siteId, this.wpcom );
	}
}

export default SiteTaxonomy;
