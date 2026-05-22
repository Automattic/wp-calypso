import config from '@automattic/calypso-config';
import { getAllowedExternalRedirectHosts } from 'calypso/my-sites/checkout/get-thank-you-page-url';

function isLocalDevHost( hostname: string ): boolean {
	if ( config( 'env_id' ) !== 'development' ) {
		return false;
	}
	return hostname === 'localhost' || hostname.endsWith( '.localhost' );
}

/**
 * Validates a redirect URL for use as the post-checkout destination in the
 * direct-to-cart flow.
 *
 * Returns the URL unchanged when valid, null otherwise. Never throws on
 * malformed input.
 *
 * Rules:
 *   1. Must parse as a URL.
 *   2. Protocol must be https, OR http when env_id=development and the host
 *      matches a localhost pattern (exact-match only — no substring tricks).
 *   3. Hostname must equal (exactly) one of the entries returned by
 *      getAllowedExternalRedirectHosts() — OR pass the localhost rule above.
 * @param rawUrl The candidate redirect URL.
 * @returns The validated URL unchanged, or null if rejected.
 */
export function sanitizeDirectToCartRedirect( rawUrl: string | null | undefined ): string | null {
	if ( ! rawUrl ) {
		return null;
	}

	let parsed: URL;
	try {
		parsed = new URL( rawUrl );
	} catch {
		return null;
	}

	// Reject URLs carrying userinfo (e.g. https://attacker@allowed.example).
	if ( parsed.username !== '' || parsed.password !== '' ) {
		return null;
	}

	// Reject visual-confusion fragments like `https://allowed.example#@evil.com`
	// — the actual host is allowed.example but a casual reader may misread the
	// `#@evil.com` suffix as the destination.
	if ( parsed.hash.includes( '@' ) ) {
		return null;
	}

	const { protocol, hostname } = parsed;
	const localDev = isLocalDevHost( hostname );

	if ( protocol === 'https:' ) {
		// fall through to hostname check
	} else if ( protocol === 'http:' && localDev ) {
		return rawUrl;
	} else {
		return null;
	}

	if ( getAllowedExternalRedirectHosts().includes( hostname ) ) {
		return rawUrl;
	}

	return null;
}
