import config from '@automattic/calypso-config';

const CALYPSO_LIVE_ORIGIN = 'https://calypso.live';

/**
 * On a calypso.live preview, returns a redirector link that resolves to the
 * previewed build's container for the given app flavour. Returns null
 * everywhere else, so callers fall back to their normal static URLs.
 *
 * `env` selects the flavour: omitted for classic Calypso, 'dashboard' for the
 * dotcom Dashboard. The redirector carries the path and any remaining query
 * params across its 302.
 */
export function calypsoLiveLink( path: string, env?: string ): string | null {
	const image = config( 'calypso_live_image' );
	if ( ! image ) {
		return null;
	}

	const url = new URL( path, CALYPSO_LIVE_ORIGIN );

	// Only stamp the redirector params onto our own links; `path` is
	// occasionally an absolute URL pointing elsewhere.
	if ( url.origin !== CALYPSO_LIVE_ORIGIN ) {
		return null;
	}

	url.searchParams.set( 'image', String( image ) );
	if ( env ) {
		url.searchParams.set( 'env', env );
	}
	return url.href;
}
