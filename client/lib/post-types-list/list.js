/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:post-types-list' );
var omit = require( 'lodash/object/omit' );
var values = require( 'lodash/object/values' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	Emitter = require( 'lib/mixins/emitter' );

/**
 * PostTypesList component
 *
 * @api public
 */
function PostTypesList() {
	if ( ! ( this instanceof PostTypesList ) ) {
		return new PostTypesList();
	}
}

/**
 * Mixins
 */
Emitter( PostTypesList.prototype );

/**
 * Given a site ID, returns an array of available post types for the
 * corresponding site. A single post type is an object including a `name`
 * and `label` properties.
 *
 * @param {int} siteId The site ID
 * @api public
 */
PostTypesList.prototype.get = function( siteId ) {
	if ( ! this.data || this.siteId !== siteId ) {
		this.fetch( siteId );
		return [];
	}

	return this.data;
};

/**
 * Fetch available post types from WordPress.com via the REST API.
 */
PostTypesList.prototype.fetch = function( siteId ) {
	if ( ! this.fetching || this.siteId !== siteId ) {
		this.fetching = true;
		this.siteId = siteId;

		debug( 'getting PostTypesList from api' );
		wpcom
		.undocumented()
		.site( siteId )
		.postTypesList( { context: 'edit' }, function( error, data ) {
			if ( error ) {
				debug( 'error fetching PostTypesList from api', error );
				return;
			}
			this.data = this.parse( data );
			this.emit( 'change' );
			this.fetching = false;
		}.bind( this ) );
	}
};

/**
 * Parse data return from the API
 *
 * @param {object} data
 * @return {array} services
 **/
PostTypesList.prototype.parse = function( data ) {
	return values( omit( data, '_headers' ) );
};

/**
 * Returns true if data has been retrieved for the specified site ID
 *
 * @param {int} siteId The site ID to check
 * @api public
 */
PostTypesList.prototype.hasDataForSiteId = function( siteId ) {
	return this.data && this.siteId === siteId;
};

/**
 * Expose `PostTypesList`
 */
module.exports = PostTypesList;
