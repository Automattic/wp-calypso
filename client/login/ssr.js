import { isDefaultLocale } from '@automattic/i18n-utils';

const VALID_QUERY_KEYS = [ 'client_id', 'signup_flow', 'redirect_to' ];

/**
 * A middleware that enables (or disables) server side rendering for the /log-in page.
 *
 * Unlike the rest of the SSRed pages, the log-in page enables SSRing also when a set of parameters is set (see below
 * validQueryKeys). Some of these parameters may need to fulfill additional formats (example: when redirect_to is
 * present, then it also needs to start with a certain prefix).
 * @param {Object}   context  The entire request context
 * @param {Function} next     Next middleware in the running sequence
 */
export function setShouldServerSideRenderLogin( context, next ) {
	context.serverSideRender =
		// if there are any parameters, they must be ONLY the ones in the list of valid query keys
		Object.keys( context.query ).every( ( key ) => VALID_QUERY_KEYS.includes( key ) ) &&
		isDefaultLocale( context.lang ) &&
		isRedirectToValidForSsr( context.query.redirect_to );

	next();
}

/**
 * Verifies if the given redirect_to value enables SSR or not.
 * @param {string}   redirectToQueryValue The URI-encoded value of the analyzed redirect_to
 * @returns {boolean} If the value of &redirect_to= on the log-in page is compatible with SSR
 */
function isRedirectToValidForSsr( redirectToQueryValue ) {
	if ( redirectToQueryValue === undefined ) {
		return true;
	}

	const redirectToDecoded = decodeURIComponent( redirectToQueryValue );
	return (
		redirectToDecoded.startsWith( 'https://wordpress.com/theme' ) ||
		// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
		redirectToDecoded.startsWith( 'https://wordpress.com/go' )
	);
}
