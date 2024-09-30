import config from '@automattic/calypso-config';
import { isDefaultLocale } from '@automattic/i18n-utils';
import { ssrSetupLocale } from 'calypso/controller';
import { setDocumentHeadMeta } from 'calypso/state/document-head/actions';
import { getDocumentHeadMeta } from 'calypso/state/document-head/selectors';

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
	/**
	 * To align with other localized sections, server-side rendering is restricted to the English and Mag-16 locales.
	 * However, since the login section has good translation coverage for non-Mag-16 locales,
	 * we'd prefer to maintain client-side rendering as a fallback,
	 * rather than redirecting non-Mag-16 locales to English, as is done for other sections.
	 */
	const isLocaleValidForSSR =
		isDefaultLocale( context.lang ) ||
		config( 'magnificent_non_en_locales' ).includes( context.lang );

	context.serverSideRender =
		// if there are any parameters, they must be ONLY the ones in the list of valid query keys
		Object.keys( context.query ).every( ( key ) => VALID_QUERY_KEYS.includes( key ) ) &&
		isLocaleValidForSSR &&
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

/**
 * Setup the locale data  when server side rendering is enabled for the request.
 * @param   {Object}   context  The entire request context
 * @param   {Function} next     Next middleware in the running sequence
 * @returns {void}
 */
export function ssrSetupLocaleLogin( context, next ) {
	if ( context.serverSideRender ) {
		ssrSetupLocale( context, next );
		return;
	}

	next();
}

export function setMetaTags( context, next ) {
	const pathSegments = context.pathname.replace( /^[/]|[/]$/g, '' ).split( '/' );
	const hasQueryString = Object.keys( context.query ).length > 0;
	const hasMag16LocaleParam = config( 'magnificent_non_en_locales' ).includes(
		context.params?.lang
	);

	/**
	 * Only the main `/log-in` and `/log-in/[mag-16-locale]` routes should be indexed.
	 */
	if ( hasQueryString || pathSegments.length > ( hasMag16LocaleParam ? 2 : 1 ) ) {
		const meta = getDocumentHeadMeta( context.store.getState() )
			// Remove existing robots meta tags to prevent duplication.
			.filter( ( { name } ) => name !== 'robots' )
			// Add the noindex meta tag.
			.concat( {
				name: 'robots',
				content: 'noindex',
			} );

		context.store.dispatch( setDocumentHeadMeta( meta ) );
	}

	next();
}
