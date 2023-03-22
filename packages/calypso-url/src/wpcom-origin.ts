/**
 * These are the known places that Calypso is allowed to run.
 */
const ALLOWED_ORIGINS = [
	'https://wordpress.com',
	'https://public-api.wordpress.com',
	'https://horizon.wordpress.com',
	'https://wpcalypso.wordpress.com',
	'http://calypso.localhost:3000',
];

/**
 * Checks if the origin is allowed by checking against ALLOWED_ORIGINS.
 *
 * @param origin string to check
 * @returns true if the origin is allowed
 */
function isAllowedOrigin( origin: string ) {
	return ALLOWED_ORIGINS.includes( origin ) || isCalypsoLive( origin );
}

/**
 * Checks if the origin is a Calypso Live site (e.g. https://busy-badger.calypso.live)
 *
 * @param origin string to check
 * @returns true if the origin is a Calypso Live site
 */
function isCalypsoLive( origin: string ) {
	return origin.match( /^https:\/\/[a-z0-9]+\.calypso\.live$/ );
}

/**
 * Gets the Calypso origin from the referrer or `origin` query arg
 * and compares it against a list of allowed wpcom origins.
 *
 * @param path Optional path to append to the origin
 * @returns The origin if it's allowed, otherwise the default origin (wordpress.com)
 */
export function getWpComOrigin( path = '' ) {
	const defaultOrigin = 'https://wordpress.com';
	const fromReferrer = document.referrer;
	const fromQueryArg = new URLSearchParams( window.location.search ).get( 'origin' ) || '';
	let origin = defaultOrigin;

	if ( isAllowedOrigin( fromReferrer ) ) {
		origin = fromReferrer;
	} else if ( isAllowedOrigin( fromQueryArg ) ) {
		origin = fromQueryArg;
	}

	if ( path.length ) {
		// remove beginning slash from path if present
		path = path.replace( /^\//, '' );
		origin = `${ origin }/${ path }`;
	}

	return origin;
}
