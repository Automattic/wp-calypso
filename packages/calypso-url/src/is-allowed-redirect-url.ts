import { getUrlParts } from './url-parts';
import { determineUrlType, URL_TYPE } from './url-type';

/**
 * Validates a URL for safe redirection.
 *
 * Prevents open redirect and XSS attacks by ensuring:
 * - Absolute path URLs (starting with `/`, not `//`) are allowed
 * - Absolute URLs must use `http:` or `https:` protocol (blocks `javascript:`, `data:`, etc.)
 * - Absolute URL hostnames must match an allowlist or pattern
 * - Scheme-relative (`//evil.com`), path-relative, and invalid URLs are rejected
 * @param url - The URL to validate.
 * @param allowedHostnames - Exact hostnames to allow (e.g., 'wordpress.com').
 * @param allowedHostnamePatterns - Optional regex patterns to match hostnames (e.g., /\.calypso\.live$/).
 * @returns True if the URL is safe to redirect to.
 */
export function isAllowedRedirectUrl(
	url: string,
	allowedHostnames: string[],
	allowedHostnamePatterns?: RegExp[]
): boolean {
	const urlType = determineUrlType( url );

	if ( urlType === URL_TYPE.PATH_ABSOLUTE ) {
		return true;
	}

	if ( urlType !== URL_TYPE.ABSOLUTE ) {
		return false;
	}

	const { protocol, hostname } = getUrlParts( url );

	if ( protocol !== 'https:' && protocol !== 'http:' ) {
		return false;
	}

	if ( ! hostname ) {
		return false;
	}

	if ( allowedHostnames.includes( hostname ) ) {
		return true;
	}

	if ( allowedHostnamePatterns?.some( ( pattern ) => pattern.test( hostname ) ) ) {
		return true;
	}

	return false;
}
