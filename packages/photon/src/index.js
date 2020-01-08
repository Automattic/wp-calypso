/**
 * External dependencies
 */
import crc32 from 'crc32';
import seed from 'seed-random';
import debugFactory from 'debug';

const debug = debugFactory( 'photon' );

/**
 * Options argument to query string parameter mappings.
 */
const mappings = {
	width: 'w',
	height: 'h',
	letterboxing: 'lb',
	removeLetterboxing: 'ulb',
};

const PARSE_BASE_HOST = '__domain__.invalid';
const PARSE_BASE_URL = `http://${ PARSE_BASE_HOST }`;
const PHOTON_BASE_URL = 'https://i0.wp.com';

/**
 * Returns a "photon" URL from the given image URL.
 *
 * Defaults to returning an `https:` secure URL from Photon.
 * Pass `secure: false` to get `http:`.
 *
 * Photon documentation: http://developer.wordpress.com/docs/photon/
 *
 * @param {string} imageUrl - the URL of the image to run through Photon
 * @param {object} [opts] - optional options object with Photon options
 * @returns {string} The generated Photon URL string
 */
export default function photon( imageUrl, opts ) {
	let parsedUrl;
	try {
		parsedUrl = new URL( imageUrl, PARSE_BASE_URL );
	} catch {
		// Return null for invalid URLs.
		return null;
	}

	const wasSecure = parsedUrl.protocol === 'https:';
	const photonUrl = new URL( PHOTON_BASE_URL );

	if ( isAlreadyPhotoned( parsedUrl.host ) ) {
		// We already have a server to use.
		// Use it, even if it doesn't match our hash.
		photonUrl.pathname = parsedUrl.pathname;
		photonUrl.hostname = parsedUrl.hostname;
	} else {
		// Photon does not support URLs with a querystring component
		if ( parsedUrl.search ) {
			return null;
		}
		let formattedUrl = parsedUrl.href.replace( `${ parsedUrl.protocol }//`, '' );
		// Handle blob: protocol URLs.
		if ( parsedUrl.protocol === 'blob:' ) {
			formattedUrl = parsedUrl.pathname.replace( '://', '//' );
		}
		// Handle path-absolute and path-relative URLs.
		if ( parsedUrl.hostname === PARSE_BASE_HOST ) {
			formattedUrl = parsedUrl.pathname;
		}
		photonUrl.pathname = formattedUrl;
		photonUrl.hostname = serverFromPathname( formattedUrl );
		if ( wasSecure ) {
			photonUrl.searchParams.set( 'ssl', 1 );
		}
	}

	if ( opts ) {
		for ( const i in opts ) {
			// allow configurable "hostname"
			if ( i === 'host' || i === 'hostname' ) {
				photonUrl.hostname = opts[ i ];
				continue;
			}

			// allow non-secure access
			if ( i === 'secure' && ! opts[ i ] ) {
				photonUrl.protocol = 'http:';
				continue;
			}

			photonUrl.searchParams.set( mappings[ i ] || i, opts[ i ] );
		}
	}

	// do this after so a passed opt can't override it

	debug( 'generated Photon URL: %s', photonUrl.href );
	return photonUrl.href;
}

function isAlreadyPhotoned( host ) {
	return /^i[0-2]\.wp\.com$/.test( host );
}

/**
 * Determine which Photon server to connect to: `i0`, `i1`, or `i2`.
 *
 * Statically hash the subdomain based on the URL, to optimize browser caches.
 *
 * @param  {string} pathname The pathname to use
 * @returns {string}          The hostname for the pathname
 */
function serverFromPathname( pathname ) {
	const hash = crc32( pathname );
	const rng = seed( hash );
	const server = 'i' + Math.floor( rng() * 3 );
	debug( 'determined server "%s" to use with "%s"', server, pathname );
	return server + '.wp.com';
}
