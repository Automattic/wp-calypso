/**
 * Result of parsing an error message for URLs.
 */
export interface ParsedErrorUrl {
	/** The error message content with the URL removed (or original if no URL) */
	content: string;
	/** The extracted URL, or null if none found */
	url: string | null;
	/** Whether the URL points to an upgrade/plans page */
	isUpgradeUrl: boolean;
	/** Whether the URL points to a plans comparison page (vs checkout) */
	isPlansPageUrl: boolean;
}

/**
 * Trusted domains whose URLs may be surfaced as clickable links in error notices.
 */
const ALLOWED_DOMAINS = [ 'wordpress.com', 'jetpack.com' ];

function isAllowedDomain( hostname: string ): boolean {
	const domain = hostname.replace( /:\d+$/, '' ).toLowerCase();

	if ( ALLOWED_DOMAINS.includes( domain ) ) {
		return true;
	}

	// Self-hosted Jetpack sites use their own admin URL for upgrade links.
	// The current origin is always trusted — the user is already on that domain.
	if ( typeof window !== 'undefined' ) {
		try {
			const currentHostname = new URL( window.location.origin ).hostname.toLowerCase();
			return domain === currentHostname;
		} catch {
			// Invalid origin — fall through to reject.
		}
	}

	return false;
}

/**
 * Parses an error message to extract a URL and determine if it's an upgrade URL.
 * Only URLs from trusted domains are surfaced as clickable links.
 * @param errorMessage - The error message that may contain a URL
 * @returns Parsed result with content, url, and isUpgradeUrl flag
 */
export function parseErrorUrl( errorMessage: string ): ParsedErrorUrl {
	const message = errorMessage.replace( /^Streaming error:\s*/i, '' );
	const urlMatch = message.match( /(https?:\/\/[^\s]+)/ );

	if ( ! urlMatch ) {
		return {
			content: message,
			url: null,
			isUpgradeUrl: false,
			isPlansPageUrl: false,
		};
	}

	const url = urlMatch[ 1 ];
	const content = message.replace( url, '' ).replace( /\s+/g, ' ' ).trim();

	// Check for upgrade URLs by examining the path portion (after the domain)
	// Remove protocol to avoid false positives like https://upgrade.example.com
	const urlWithoutProtocol = url.replace( /^https?:\/\//, '' );
	const pathStart = urlWithoutProtocol.indexOf( '/' );
	const pathAndQuery = pathStart >= 0 ? urlWithoutProtocol.slice( pathStart ) : '';
	const hostname = pathStart >= 0 ? urlWithoutProtocol.slice( 0, pathStart ) : urlWithoutProtocol;

	// Reject URLs from untrusted domains.
	if ( ! isAllowedDomain( hostname ) ) {
		return {
			content,
			url: null,
			isUpgradeUrl: false,
			isPlansPageUrl: false,
		};
	}

	const isUpgradeUrl =
		pathAndQuery.includes( '/plans/' ) ||
		pathAndQuery.startsWith( '/upgrade' ) ||
		( hostname === 'jetpack.com' && pathAndQuery.startsWith( '/redirect' ) ) ||
		pathAndQuery.includes( 'my-jetpack' );

	const isPlansPageUrl = pathAndQuery.includes( '/plans/' );

	return {
		content,
		url,
		isUpgradeUrl,
		isPlansPageUrl,
	};
}
