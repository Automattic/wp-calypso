/**
 * External dependencies
 */
import { intersection } from 'lodash';

/**
 * Internal dependencies
 */
import { isDefaultLocale } from 'calypso/lib/i18n-utils';

/**
 * A middleware that enables (or disables) server side rendering for the /log-in page.
 *
 * Unlike the rest of the SSRed pages, the log-in page enables SSRing also when a set of parameters is set (see below
 * validQueryKeys). Some of these parameters may need to fulfill additional formats (example: when redirect_to is
 * present, then it also needs to start with a certain prefix).
 *
 * @param {object}   context  The entire request context
 * @param {Function} next     Next middleware in the running sequence
 */
export function setShouldServerSideRenderLogin( context, next ) {
	const validQueryKeys = [ 'client_id', 'signup_flow', 'redirect_to' ];
	const queryKeys = Object.keys( context.query );

	// if there are any parameters, they must be ONLY the ones in the list of valid query keys
	const hasOnlyValidKeys = queryKeys.length === intersection( queryKeys, validQueryKeys ).length;

	context.serverSideRender =
		hasOnlyValidKeys &&
		isDefaultLocale( context.lang ) &&
		isRedirectToValidForSsr( context.query.redirect_to );

	next();
}

/**
 * Verifies if the given redirect_to value enables SSR or not.
 *
 * @param {string}   redirectToQueryValue The URI-encoded value of the analyzed redirect_to
 * @returns {boolean} If the value of &redirect_to= on the log-in page is compatible with SSR
 */
function isRedirectToValidForSsr( redirectToQueryValue ) {
	if ( 'undefined' === typeof redirectToQueryValue ) {
		return true;
	}

	const redirectToDecoded = decodeURIComponent( redirectToQueryValue );
	return (
		redirectToDecoded.startsWith( 'https://wordpress.com/theme' ) ||
		redirectToDecoded.startsWith( 'https://wordpress.com/go' )
	);
}
