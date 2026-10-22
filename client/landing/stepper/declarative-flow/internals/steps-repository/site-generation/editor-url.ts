// The status API computes this URL from the site's admin URL, including custom domains.
export function getEditorUrlFromStatus( liveUrl: unknown, source?: string | null ): string | null {
	if ( typeof liveUrl !== 'string' || ! liveUrl ) {
		return null;
	}

	let parsed: URL;
	try {
		parsed = new URL( liveUrl );
	} catch {
		return null;
	}

	const isLocalHttpDestination =
		parsed.hostname === window.location.hostname &&
		parsed.protocol === 'http:' &&
		window.location.protocol === 'http:';
	if ( parsed.protocol !== 'https:' && ! isLocalHttpDestination ) {
		return null;
	}

	if ( source && ! parsed.searchParams.has( 'source' ) ) {
		parsed.searchParams.set( 'source', source );
	}

	return parsed.href;
}
