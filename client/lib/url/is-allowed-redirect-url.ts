/**
 * Validates a URL for safe redirection.
 *
 * Prevents open redirect and XSS attacks by ensuring:
 * - Relative URLs (starting with `/`) are allowed, except protocol-relative (`//`)
 * - Absolute URLs must use `http:` or `https:` protocol (blocks `javascript:`, `data:`, etc.)
 * - Absolute URL hostnames must match an allowlist or pattern
 */
export default function isAllowedRedirectUrl(
	url: string,
	allowedHostnames: string[],
	allowedHostnamePatterns?: RegExp[]
): boolean {
	if ( url.startsWith( '/' ) && ! url.startsWith( '//' ) ) {
		return true;
	}

	try {
		const parsed = new URL( url );

		if ( parsed.protocol !== 'https:' && parsed.protocol !== 'http:' ) {
			return false;
		}

		if ( ! parsed.hostname ) {
			return false;
		}

		if ( allowedHostnames.includes( parsed.hostname ) ) {
			return true;
		}

		if ( allowedHostnamePatterns?.some( ( pattern ) => pattern.test( parsed.hostname ) ) ) {
			return true;
		}

		return false;
	} catch {
		return false;
	}
}
