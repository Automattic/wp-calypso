/**
 * External dependencies
 */

import { mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import safeImageUrl from 'lib/safe-image-url';
import { getUrlParts, getUrlFromParts } from 'lib/url/url-parts';

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
 * @type {number}
 */
const IMAGE_SCALE_FACTOR = typeof window !== 'undefined' && window?.devicePixelRatio > 1 ? 2 : 1;

/**
 * Query parameters to be treated as image dimensions
 *
 * @type {string[]}
 */
const SIZE_PARAMS = [ 'w', 'h', 'resize', 'fit', 's' ];

/**
 * Mappings of supported safe services to patterns by which they can be matched
 *
 * @type {object}
 */
const SERVICE_HOSTNAME_PATTERNS = {
	photon: /(^[is]\d\.wp\.com|(^|\.)wordpress\.com)$/,
	gravatar: /(^|\.)gravatar\.com$/,
};

/**
 * Given a numberic value, returns the value multiplied by image scale factor
 *
 * @param  {number} value Original value
 * @returns {number}       Updated value
 */
const scaleByFactor = ( value ) => value * IMAGE_SCALE_FACTOR;

/**
 * Changes the sizing parameters on a URL. Works for WordPress.com, Photon, and
 * Gravatar images.
 *
 * NOTE: Original query string arguments will be stripped from WordPress.com
 * and Photon images, and preserved for Gravatar images. If an external image
 * URL containing query string arguments is passed to this function, it will
 * return `null`.
 *
 * @param   {string}          imageUrl Original image url
 * @param   {(number|object)} resize   Resize pixel width, or object of query
 *                                     arguments (assuming Photon or Gravatar)
 * @param   {?number}         height   Pixel height if specifying resize width
 * @param   {?boolean}        makeSafe Should we make sure this is on a safe host?
 * @returns {?string}                  Resized image URL, or `null` if unable to resize
 */
export default function resizeImageUrl( imageUrl, resize, height, makeSafe = true ) {
	if ( 'string' !== typeof imageUrl ) {
		return imageUrl;
	}

	const { search, ...resultUrl } = getUrlParts( imageUrl );

	if ( ! REGEXP_VALID_PROTOCOL.test( resultUrl.protocol ) ) {
		return imageUrl;
	}
	if ( ! resultUrl.hostname ) {
		// no hostname? must be a bad url.
		return imageUrl;
	}

	SIZE_PARAMS.forEach( ( param ) => resultUrl.searchParams.delete( param ) );

	const service = Object.keys( SERVICE_HOSTNAME_PATTERNS ).find( ( key ) =>
		resultUrl.hostname.match( SERVICE_HOSTNAME_PATTERNS[ key ] )
	);

	if ( 'number' === typeof resize ) {
		if ( 'gravatar' === service ) {
			resize = { s: resize };
		} else {
			resize = height > 0 ? { fit: [ resize, height ].join() } : { w: resize };
		}
	}

	// External URLs are made "safe" (i.e. passed through Photon), so
	// recurse with an assumed set of query arguments for Photon
	if ( ! service && makeSafe ) {
		return resizeImageUrl( safeImageUrl( imageUrl ), resize, null, false );
	}

	// Map sizing parameters, multiplying their values by the scale factor
	const mapped = mapValues( resize, ( value, key ) => {
		if ( 'resize' === key || 'fit' === key ) {
			return value.split( ',' ).map( scaleByFactor ).join( ',' );
		} else if ( SIZE_PARAMS.includes( key ) ) {
			return scaleByFactor( value );
		}

		return value;
	} );

	for ( const key of Object.keys( mapped ) ) {
		resultUrl.searchParams.set( key, mapped[ key ] );
	}

	return getUrlFromParts( resultUrl ).href;
}
