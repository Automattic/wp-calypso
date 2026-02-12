import type { AuthorizeMeta } from './use-authorize-meta';

/**
 * Safely decodes HTML entities in a string using DOMParser.
 * This prevents XSS vulnerabilities that could occur with innerHTML.
 * @param html - The string containing HTML entities to decode
 * @returns The decoded string
 */
export const decodeHtmlEntities = ( html: string ): string => {
	const doc = new DOMParser().parseFromString( html, 'text/html' );
	return doc.documentElement.textContent || html;
};

/**
 * Checks if a redirect URI uses a custom protocol (not http/https).
 * Custom protocols are used by apps like Studio (wpcom-local-dev://).
 * @param redirectUri - The redirect URI to check
 * @returns True if the URI uses a custom protocol
 */
export const isCustomProtocol = ( redirectUri: string ): boolean => {
	return Boolean( redirectUri && ! /^https?:\/\//.test( redirectUri ) );
};

/**
 * Builds the OAuth2 authorization URL with all required parameters.
 * Copies parameters from redirect_to URL, ensures blog_id is set,
 * and adds the nonce for security.
 * @param meta - The authorization metadata from the API
 * @returns The complete authorization URL
 */
export const buildAuthorizeUrl = ( meta: AuthorizeMeta ): URL => {
	const authorizeUrl = new URL( meta.links.authorize, window.location.origin );
	const redirectToUrl = new URL( meta.links.redirect_to, window.location.origin );

	// Copy all parameters from redirect_to to authorize URL
	redirectToUrl.searchParams.forEach( ( value, key ) => {
		authorizeUrl.searchParams.set( key, value );
	} );

	// Ensure blog_id is set (required by backend, use 0 for WordPress.com Connect)
	if ( ! authorizeUrl.searchParams.has( 'blog_id' ) ) {
		authorizeUrl.searchParams.set( 'blog_id', '0' );
	}

	// Add the nonce
	if ( meta.nonce?._wpnonce ) {
		authorizeUrl.searchParams.set( '_wpnonce', meta.nonce._wpnonce );
	}

	return authorizeUrl;
};

/**
 * Handles the OAuth2 authorization approval flow.
 * Builds the authorization URL and redirects the user.
 * @param meta - The authorization metadata from the API
 * @param onSuccessCallback - Optional callback for custom protocol redirects
 */
export const handleApprove = ( meta: AuthorizeMeta, onSuccessCallback?: () => void ): void => {
	const params = new URLSearchParams( window.location.search );
	const redirectUri = params.get( 'redirect_uri' ) || '';
	const authorizeUrl = buildAuthorizeUrl( meta );

	// Redirect to authorization endpoint
	window.location.href = authorizeUrl.toString();

	// For custom protocol, show success message after redirect starts
	if ( isCustomProtocol( redirectUri ) && onSuccessCallback ) {
		setTimeout( () => {
			onSuccessCallback();
		}, 500 );
	}
};

/**
 * Handles the OAuth2 authorization denial flow.
 * Decodes the deny URL and redirects the user.
 * @param meta - The authorization metadata from the API
 */
export const handleDeny = ( meta: AuthorizeMeta ): void => {
	// Decode HTML entities in the deny URL (backend may return &amp; instead of &)
	const decodedUrl = decodeHtmlEntities( meta.links.deny );
	window.location.href = decodedUrl;
};
