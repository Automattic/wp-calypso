/**
 * External dependencies
 */
import url from 'url';
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
 * @api public
 */
export default function photon( imageUrl, opts ) {
	// parse the URL, assuming //host.com/path style URLs are ok and parse the querystring
	const parsedUrl = url.parse( imageUrl, true, true );
	const wasSecure = parsedUrl.protocol === 'https:';

	delete parsedUrl.protocol;
	delete parsedUrl.auth;
	delete parsedUrl.port;

	const params = {
		slashes: true,
		protocol: 'https:',
		query: {},
	};

	if ( isAlreadyPhotoned( parsedUrl.host ) ) {
		// We already have a server to use.
		// Use it, even if it doesn't match our hash.
		params.pathname = parsedUrl.pathname;
		params.hostname = parsedUrl.hostname;
	} else {
		// Photon does not support URLs with a querystring component
		if ( parsedUrl.search ) {
			return null;
		}
		const formattedUrl = url.format( parsedUrl );
		params.pathname =
			0 === formattedUrl.indexOf( '//' ) ? formattedUrl.substring( 1 ) : formattedUrl;
		params.hostname = serverFromPathname( params.pathname );
		if ( wasSecure ) {
			params.query.ssl = 1;
		}
	}

	if ( opts ) {
		for ( const i in opts ) {
			// allow configurable "hostname"
			if ( i === 'host' || i === 'hostname' ) {
				params.hostname = opts[ i ];
				continue;
			}

			// allow non-secure access
			if ( i === 'secure' && ! opts[ i ] ) {
				params.protocol = 'http:';
				continue;
			}

			params.query[ mappings[ i ] || i ] = opts[ i ];
		}
	}

	// do this after so a passed opt can't override it

	const photonUrl = url.format( params );
	debug( 'generated Photon URL: %s', photonUrl );
	return photonUrl;
}

function isAlreadyPhotoned( host ) {
	return /^i[0-2]\.wp\.com$/.test( host );
}

/**
 * Determine which Photon server to connect to: `i0`, `i1`, or `i2`.
 *
 * Statically hash the subdomain based on the URL, to optimize browser caches.
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
