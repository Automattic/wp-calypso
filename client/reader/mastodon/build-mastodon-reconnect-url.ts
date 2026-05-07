const WPCOM_BASE = 'https://public-api.wordpress.com';

/**
 * Builds the URL to navigate to in order to start the OAuth reconnect
 * flow for a Mastodon connection. The returned URL points at wpcom's
 * reconnect endpoint, which 302s through the user's Mastodon instance
 * and back to redirect_to. We append `?reconnected={id}` to the return
 * path so MastodonAccountView can fire the success notice on landing.
 *
 * COORDINATION POINT: the wpcom-side reconnect endpoint must preserve
 * the redirect_to query string exactly. If it strips/replaces query
 * params, the `reconnected` marker is lost and no toast fires.
 * Verified in the companion wpcom PR.
 */
export function buildMastodonReconnectUrl( connectionId: number, returnPath: string ): string {
	const returnUrl = new URL( returnPath, 'https://wordpress.com' );
	returnUrl.searchParams.set( 'reconnected', String( connectionId ) );
	const returnPathWithMarker = returnUrl.pathname + returnUrl.search;

	const reconnect = new URL(
		`/wpcom/v2/reader/mastodon/connections/${ connectionId }/reconnect`,
		WPCOM_BASE
	);
	reconnect.searchParams.set( 'redirect_to', returnPathWithMarker );
	return reconnect.toString();
}
