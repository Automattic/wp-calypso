/**
 * Internal dependencies
 */
import { format, getUrlParts, getUrlFromParts, determineUrlType } from 'lib/url';

const IMAGE_SCALE_FACTOR =
	typeof window !== 'undefined' && window.devicePixelRatio && window.devicePixelRatio > 1 ? 2 : 1;

const DEFAULT_PHOTON_QUALITY = 80; // 80 was chosen after some heuristic testing as the best blend of size and quality

export function maxWidthPhotonishURL( imageURL, width ) {
	if ( ! imageURL ) {
		return imageURL;
	}

	const urlParts = getUrlParts( imageURL );
	const urlType = determineUrlType( imageURL );

	// Return the unformatted imageURL for path-relative or path-absolute URLs.
	if ( ! urlParts.host ) {
		return imageURL;
	}

	// From this point on, we should only have absolute and scheme-relative URLs.

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

	const extendedUrl = getUrlFromParts( {
		...urlParts,
		// Provide a protocol if one is missing. This is the case for some image ads.
		protocol: urlParts.protocol || 'https:',
		// Override original search params.
		searchParams: sortedParams,
	} ).href;

	try {
		// Format back to original URL type (e.g. scheme-relative).
		return format( extendedUrl, urlType );
	} catch {
		// Something failed in the formatting, so return just return the full extended URL.
		return extendedUrl;
	}
}
