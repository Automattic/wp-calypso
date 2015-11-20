/**
 * External Dependencies
 */
var assign = require( 'lodash/object/assign' ),
	omit = require( 'lodash/object/omit' ),
	url = require( 'url' );
/**
 * Changes the sizing parameters on a URL. Works for wpcom and photon.
 * @param {string} imageUrl The URL to add sizing params to
 * @param {object} params The parameters to add
 */
function resizeImageUrl( imageUrl, params ) {
	var parsedUrl = url.parse( imageUrl, true, true );

	parsedUrl.query = omit( parsedUrl.query, [ 'w', 'h', 'resize', 'fit' ] );

	parsedUrl.query = assign( parsedUrl.query, params );

	delete parsedUrl.search;

	return url.format( parsedUrl );
}

module.exports = resizeImageUrl;
