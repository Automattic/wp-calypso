import crc32 from 'crc32';
import debugFactory from 'debug';
import seed from 'seed-random';

const debug = debugFactory( 'photon' );

/**
 * Options argument to query string parameter mappings.
 */
const mappings: Record< string, string > = {
	width: 'w',
	height: 'h',
	letterboxing: 'lb',
	removeLetterboxing: 'ulb',
};

const PARSE_BASE_HOST = '__domain__.invalid';
const PARSE_BASE_URL = `https://${ PARSE_BASE_HOST }`;
const PHOTON_BASE_URL = 'https://i0.wp.com';

type PhotonOpts = {
	width?: number;
	height?: number;
	hostname?: string;
	host?: string;
	secure?: boolean;
	zoom?: number;
	resize?: string;
	fit?: string;
	letterboxing?: string;
	removeLetterBoxing?: boolean;
};

/**
 * Returns a "photon" URL from the given image URL.
 *
 * Defaults to returning an `https:` secure URL from Photon.
 * Pass `secure: false` to get `http:`.
 *
 * Photon documentation: http://developer.wordpress.com/docs/photon/
 * @param imageUrl - the URL of the image to run through Photon
 * @param [opts]   - optional options object with Photon options
 * @returns The generated Photon URL string
 */
export default function photon( imageUrl: string, opts?: PhotonOpts ): string | null {
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
		photonUrl.hostname = wasSecure ? 'i0.wp.com' : parsedUrl.hostname;
	} else {
		// Photon does not support URLs with a querystring component
		if ( parsedUrl.search ) {
			return null;
		}
		let formattedUrl = parsedUrl.href.replace( `${ parsedUrl.protocol }/`, '' );
		// Handle blob: protocol URLs.
		if ( parsedUrl.protocol === 'blob:' ) {
			formattedUrl = parsedUrl.pathname.replace( '://', '//' );
		}
		// Handle path-absolute and path-relative URLs.
		if ( parsedUrl.hostname === PARSE_BASE_HOST ) {
			formattedUrl = parsedUrl.pathname;
		}
		photonUrl.pathname = formattedUrl;
		photonUrl.hostname = serverFromUrlParts( formattedUrl, photonUrl.protocol === 'https:' );
		if ( wasSecure ) {
			photonUrl.searchParams.set( 'ssl', '1' );
		}
	}

	if ( opts ) {
		for ( const [ opt, value ] of Object.entries( opts ) ) {
			if ( opt === 'host' || opt === 'hostname' ) {
				photonUrl.hostname = value as string;
				continue;
			}
			if ( opt === 'secure' && ! value ) {
				photonUrl.protocol = 'http:';
				continue;
			}
			photonUrl.searchParams.set( mappings[ opt ] ?? opt, value.toString() );
		}
	}

	// do this after so a passed opt can't override it

	debug( 'generated Photon URL: %s', photonUrl.href );
	return photonUrl.href;
}

function isAlreadyPhotoned( host: string ) {
	return /^i[0-2]\.wp\.com$/.test( host );
}

/**
 * Determine which Photon server to connect to: `i0`, `i1`, or `i2`.
 *
 * Statically hash the subdomain based on the URL, to optimize browser caches.
 * Only use i0 when using photon over https, based on the assumption that https
 * maps to http/2 (or later)
 * @param  {string} pathname The pathname to use
 * @param  {boolean} isSecure Whether we're constructing a HTTPS URL or a HTTP one
 * @returns {string}          The hostname for the pathname
 */
function serverFromUrlParts( pathname: string, isSecure: boolean ) {
	if ( isSecure ) {
		return 'i0.wp.com';
	}
	const hash = crc32( pathname );
	const rng = seed( hash );
	const server = 'i' + Math.floor( rng() * 3 );
	debug( 'determined server "%s" to use with "%s"', server, pathname );
	return server + '.wp.com';
}
