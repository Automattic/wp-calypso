/**
 * Internal dependencies
 */
import { getUrlParts, getUrlFromParts } from 'lib/url';

const IMAGE_SCALE_FACTOR =
	typeof window !== 'undefined' && window.devicePixelRatio && window.devicePixelRatio > 1 ? 2 : 1;

const DEFAULT_PHOTON_QUALITY = 80; // 80 was chosen after some heuristic testing as the best blend of size and quality

export function maxWidthPhotonishURL( imageURL, width ) {
	if ( ! imageURL ) {
		return imageURL;
	}

	let urlParts = {};
	try {
		urlParts = getUrlParts( imageURL ); // true, true means allow protocol-less hosts and parse the querystring
	} catch ( e ) {
		/**
		 * `url.parse` throws in a few places where it calls decodeURIComponent
		 *
		 * @see e.g. https://github.com/Automattic/wp-calypso/issues/18645
		 */
	}

	if ( ! urlParts.host ) {
		return imageURL;
	}

	const isGravatar = urlParts.host.indexOf( 'gravatar.com' ) !== -1;

	delete urlParts.search;
	// strip other sizing params
	for ( const param of [ 'h', 'crop', 'resize', 'fit' ] ) {
		urlParts.searchParams.delete( param );
	}

	const sizeParam = isGravatar ? 's' : 'w';
	urlParts.searchParams.set( sizeParam, width * IMAGE_SCALE_FACTOR );

	if ( ! isGravatar ) {
		// gravatar doesn't support these, only photon / files.wordpress
		urlParts.searchParams.set( 'quality', DEFAULT_PHOTON_QUALITY );
		urlParts.searchParams.set( 'strip', 'info' ); // strip all exif data, leave ICC intact
	}

	// make a new query object with keys in a known order
	const sortedKeys = Array.from( urlParts.searchParams.keys() ).sort();
	const sortedParams = new URLSearchParams();
	sortedKeys.forEach( ( key ) => sortedParams.set( key, urlParts.searchParams.get( key ) ) );

	return getUrlFromParts( { ...urlParts, searchParams: sortedParams } ).href;
}
