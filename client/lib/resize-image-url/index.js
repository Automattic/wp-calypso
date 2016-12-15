/**
 * External Dependencies
 */
import { get, assign, omit, includes, mapValues } from 'lodash';
import { parse, format } from 'url';

/**
 * Pattern matching valid http(s) URLs
 *
 * @type {RegExp}
 */
const REGEXP_VALID_PROTOCOL = /^https?:$/;

/**
 * Factor by which dimensions should be multiplied, specifically accounting for
 * high pixel-density displays (e.g. retina). This multiplier currently maxes
 * at 2x image size, though could foreseeably be the exact display ratio.
 *
 * @type {Number}
 */
const IMAGE_SCALE_FACTOR = get( global.window, 'devicePixelRatio', 1 ) > 1 ? 2 : 1;

/**
 * Query parameters to be treated as image dimensions
 *
 * @type {String[]}
 */
const SIZE_PARAMS = [ 'w', 'h', 'resize', 'fit', 's' ];

/**
 * Given a numberic value, returns the value multiplied by image scale factor
 *
 * @param  {Number} value Original value
 * @return {Number}       Updated value
 */
const scaleByFactor = ( value ) => value * IMAGE_SCALE_FACTOR;

/**
 * Changes the sizing parameters on a URL. Works for WordPress.com, Photon, and
 * Gravatar images
 *
 * @param   {String} imageUrl Original image url
 * @param   {Object} params   Resize parameters to add
 * @returns {String}          Resize image URL
 */
export default function resizeImageUrl( imageUrl, params ) {
	const parsedUrl = parse( imageUrl, true, true );
	if ( ! REGEXP_VALID_PROTOCOL.test( parsedUrl.protocol ) ) {
		return imageUrl;
	}

	parsedUrl.query = omit( parsedUrl.query, SIZE_PARAMS );

	// Map sizing parameters, multiplying their values by the scale factor
	assign( parsedUrl.query, mapValues( params, ( value, key ) => {
		if ( 'resize' === key || 'fit' === key ) {
			return value.split( ',' ).map( scaleByFactor ).join( ',' );
		} else if ( includes( SIZE_PARAMS, key ) ) {
			return scaleByFactor( value );
		}

		return value;
	} ) );

	delete parsedUrl.search;

	return format( parsedUrl );
}
