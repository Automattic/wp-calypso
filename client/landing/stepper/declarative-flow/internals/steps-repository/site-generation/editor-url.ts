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

	if ( parsed.protocol !== 'https:' && parsed.protocol !== 'http:' ) {
		return null;
	}

	const { hostname } = parsed;
	const isAllowedHost =
		hostname === window.location.hostname ||
		hostname === 'wordpress.com' ||
		ALLOWED_HOST_SUFFIXES.some( ( suffix ) => hostname.endsWith( suffix ) );

	return isAllowedHost ? parsed.href : null;
}
