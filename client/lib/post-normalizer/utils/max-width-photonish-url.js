/**
 * External Dependencies
 */
import url from 'url';

const IMAGE_SCALE_FACTOR =
	typeof window !== 'undefined' && window.devicePixelRatio && window.devicePixelRatio > 1 ? 2 : 1;

const DEFAULT_PHOTON_QUALITY = 80; // 80 was chosen after some heuristic testing as the best blend of size and quality

export function maxWidthPhotonishURL( imageURL, width ) {
	if ( ! imageURL ) {
		return imageURL;
	}

	let parsedURL = {};
	try {
		parsedURL = url.parse( imageURL, true, true ); // true, true means allow protocol-less hosts and parse the querystring
	} catch ( e ) {
		/**
		 * `url.parse` throws in a few places where it calls decodeURIComponent
		 *
		 * @see e.g. https://github.com/Automattic/wp-calypso/issues/18645
		 */
	}

	if ( ! parsedURL.host ) {
		return imageURL;
	}

	const isGravatar = parsedURL.host.indexOf( 'gravatar.com' ) !== -1;

	delete parsedURL.search;
	// strip other sizing params
	for ( const param of [ 'h', 'crop', 'resize', 'fit' ] ) {
		delete parsedURL.query[ param ];
	}

	const sizeParam = isGravatar ? 's' : 'w';
	parsedURL.query[ sizeParam ] = width * IMAGE_SCALE_FACTOR;

	if ( ! isGravatar ) {
		// gravatar doesn't support these, only photon / files.wordpress
		parsedURL.query.quality = DEFAULT_PHOTON_QUALITY;
		parsedURL.query.strip = 'info'; // strip all exif data, leave ICC intact
	}

	// make a new query object with keys in a known order
	parsedURL.query = Object.keys( parsedURL.query )
		.sort()
		.reduce( ( memo, key ) => {
			memo[ key ] = parsedURL.query[ key ];
			return memo;
		}, {} );

	return url.format( parsedURL );
}
