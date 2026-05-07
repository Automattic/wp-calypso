const WPCOM_BASE = 'https://public-api.wordpress.com';

/**
 * Builds the URL to navigate to in order to start the OAuth reconnect
 * flow for a Mastodon connection. The returned URL points at wpcom's
 * `/wpcom/v2/reader/mastodon/connections/{id}/reconnect` endpoint,
 * which 302s through the user's Mastodon instance and back to
 * redirect_to. We append `?reconnected={id}` to the return path so
 * MastodonAccountView can fire the success notice on landing.
 *
 * Cross-stack contract: the wpcom-side reconnect endpoint must echo
 * the `redirect_to` query string verbatim into its 302 Location header.
 * If it strips/replaces query params, the `reconnected` marker is lost
 * and no toast fires.
 */
export function buildMastodonReconnectUrl( connectionId: number, returnPath: string ): string {
	if ( ! Number.isInteger( connectionId ) || connectionId <= 0 ) {
		throw new Error( 'buildMastodonReconnectUrl: connectionId must be a positive integer' );
	}
	// Reject anything that isn't a single-leading-slash internal path. Protocol-
	// relative `//evil.example/foo`, absolute `https://…`, and empty values
	// would otherwise flow into `redirect_to`. The wpcom endpoint should
	// allowlist the value too — defense in depth.
	const safeReturnPath =
		returnPath.startsWith( '/' ) && ! returnPath.startsWith( '//' ) ? returnPath : '/reader';
	const returnUrl = new URL( safeReturnPath, 'https://wordpress.com' );
	returnUrl.searchParams.set( 'reconnected', String( connectionId ) );
	const returnPathWithMarker = returnUrl.pathname + returnUrl.search;

	const reconnect = new URL(
		`/wpcom/v2/reader/mastodon/connections/${ connectionId }/reconnect`,
		WPCOM_BASE
	);
	reconnect.searchParams.set( 'redirect_to', returnPathWithMarker );
	return reconnect.toString();
}
