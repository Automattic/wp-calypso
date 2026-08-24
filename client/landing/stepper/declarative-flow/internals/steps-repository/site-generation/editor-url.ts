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
