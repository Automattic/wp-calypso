/**
 * External Dependencies
 */
var assign = require( 'lodash/assign' ),
	omit = require( 'lodash/omit' ),
	url = require( 'url' );

const IMAGE_SCALE_FACTOR = ( typeof window !== 'undefined' && window.devicePixelRatio && window.devicePixelRatio > 1 ) ? 2 : 1;

/**
 * Changes the sizing parameters on a URL. Works for wpcom and photon.
 * @param {string} imageUrl The URL to add sizing params to
 * @param {object} params The parameters to add
 * @returns {string} The resized URL
 */
function resizeImageUrl( imageUrl, params ) {
	var parsedUrl = url.parse( imageUrl, true, true );

	if ( ! /^https?:$/.test( parsedUrl.protocol ) ) {
		return imageUrl;
	}

	parsedUrl.query = omit( parsedUrl.query, [ 'w', 'h', 'resize', 'fit' ] );

	const localParams = assign( {}, params );
	if ( localParams.w ) {
		localParams.w *= IMAGE_SCALE_FACTOR;
	}

	if ( localParams.h ) {
		localParams.h *= IMAGE_SCALE_FACTOR;
	}

	if ( localParams.resize ) {
		let [ width, height ] = localParams.resize.split( ',' );
		width *= IMAGE_SCALE_FACTOR;
		height *= IMAGE_SCALE_FACTOR;
		localParams.resize = `${width},${height}`;
	}

	parsedUrl.query = assign( parsedUrl.query, localParams );

	delete parsedUrl.search;

	return url.format( parsedUrl );
}

module.exports = resizeImageUrl;
