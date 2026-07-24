/**
 * Resolves `path` against `baseUrl`, keeping any query parameters that
 * `baseUrl` itself carries.
 *
 * `new URL( path, baseUrl )` drops the base's query string, which is fine while
 * the configured app URLs are plain origins. On calypso.live previews they are
 * redirector links instead — `https://calypso.live/?image=<ref>[&env=<flavour>]`
 * — and the parameters are the whole point: the redirector reads them, then
 * 302s to the matching preview container, carrying the path and the remaining
 * query with it. Parameters in `path` win over ones in `baseUrl`.
 */
export function buildLinkFromBaseUrl( path: string, baseUrl: string ): string {
	const url = new URL( path, baseUrl );

	for ( const [ key, value ] of new URL( baseUrl ).searchParams ) {
		if ( ! url.searchParams.has( key ) ) {
			url.searchParams.set( key, value );
		}
	}

	return url.href;
}
