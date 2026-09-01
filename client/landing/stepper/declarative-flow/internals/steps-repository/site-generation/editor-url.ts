const ALLOWED_HOST_SUFFIXES = [ '.wordpress.com', '.wpcomstaging.com' ];

export function getSafeEditorUrl( rawUrl: string | null ): string | null {
	if ( ! rawUrl ) {
		return null;
	}

	let parsed: URL;
	try {
		parsed = new URL( rawUrl, window.location.origin );
	} catch {
		return null;
	}

	const isCurrentHost = parsed.hostname === window.location.hostname;
	const isLocalHttpDestination =
		isCurrentHost && parsed.protocol === 'http:' && window.location.protocol === 'http:';
	if ( parsed.protocol !== 'https:' && ! isLocalHttpDestination ) {
		return null;
	}

	const { hostname } = parsed;
	const isAllowedHost =
		isCurrentHost ||
		hostname === 'wordpress.com' ||
		ALLOWED_HOST_SUFFIXES.some( ( suffix ) => hostname.endsWith( suffix ) );

	return isAllowedHost ? parsed.href : null;
}

// The editor URL the site-spec step captured came from the build's POST
// response, before the generated front page existed, so it names no route.
// Once the build is live the status endpoint's site_editor_url points at
// that page on the edit canvas: prefer it, and carry over the query args the
// flow added to the captured URL (spec_id, source) that it does not have.
// Anything unusable falls back to the captured URL.
export function getLiveEditorUrl( capturedUrl: string, liveUrl: unknown ): string {
	const safeLiveUrl = getSafeEditorUrl( typeof liveUrl === 'string' ? liveUrl : null );
	if ( ! safeLiveUrl ) {
		return capturedUrl;
	}

	const destination = new URL( safeLiveUrl );
	new URL( capturedUrl ).searchParams.forEach( ( value, key ) => {
		if ( ! destination.searchParams.has( key ) ) {
			destination.searchParams.append( key, value );
		}
	} );
	return destination.href;
}
