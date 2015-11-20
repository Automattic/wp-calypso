/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:tags-list' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	Emitter = require( 'lib/mixins/emitter' ),
	Pageable = require( 'lib/mixins/pageable' );

/**
 * TagsList component
 *
 * @param {string/number} siteID - the siteID to fetch tags from
 * @api public
 */
function TagsList( siteID ) {
	if ( ! ( this instanceof TagsList ) ) {
		return new TagsList( siteID );
	}

	this.siteID = siteID;
	this.data = [];
	this.perPage = 100;
}

/**
 * Mixins
 */
Emitter( TagsList.prototype );
Pageable( TagsList.prototype );

/**
 * Returns an array of available tags for the
 * corresponding site. A single tag is an object including  `name`
 * and `ID` properties.
 *
 * @api public
 */
TagsList.prototype.get = function() {
	return this.data;
};

/**
 * Fetch tags from a single site
 */
TagsList.prototype.fetch = function( options, callback ) {
	var query = options || {},
		normalizedSiteID = ( '' + this.siteID ).replace( /::/g, '/' );

	if ( ! this.siteID ) {
		debug( 'Endpoint needs a site id to fetch from' );
		return;
	}

	debug( 'Fetching tags for %s %o', this.siteID, query );

	wpcom.site( normalizedSiteID ).tagsList( options, this.handleResponse.bind( this, options, callback ) );
};

/**
 * Parse data return from the API
 *
 * @param {object} data
 * @return {array} tags
 **/
TagsList.prototype.parse = function( data ) {
	return data.tags;
};

/**
 * Expose `TagsList`
 */
module.exports = TagsList;
