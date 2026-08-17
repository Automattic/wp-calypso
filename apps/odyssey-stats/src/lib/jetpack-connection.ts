/**
 * A minimal client for the site's own Jetpack connection endpoints, used by the screen a site
 * sees before it is connected to WordPress.com.
 *
 * `@automattic/jetpack-connection` would be the natural client, but it depends on
 * `@automattic/jetpack-components`, which the Odyssey build cannot take — so this talks to the
 * REST API directly, against the same state blob that package reads.
 */

interface ConnectionInitialState {
	apiRoot: string;
	apiNonce: string;
	registrationNonce?: string;
	siteSuffix?: string;
	isOfflineMode?: boolean;
}

declare global {
	interface Window {
		JP_CONNECTION_INITIAL_STATE?: ConnectionInitialState;
	}
}

/**
 * Jetpack prints this alongside the Stats app only from the release that introduced the
 * pre-connection screen, and the app ships from a CDN — so an older plugin serving a newer bundle
 * has to read as "nothing known about the connection" rather than crash.
 */
function getInitialState(): ConnectionInitialState | undefined {
	return window.JP_CONNECTION_INITIAL_STATE;
}

/**
 * Whether the site is in offline mode, and so can never reach WordPress.com to be registered.
 *
 * Read from the top-level flag rather than `connectionStatus.offlineMode`, which is an object
 * describing which of the several offline-mode signals fired, and so is always truthy.
 */
export function isOfflineMode(): boolean {
	return getInitialState()?.isOfflineMode ?? false;
}

/**
 * The Jetpack site slug (`example.com`, or `example.com::path` for a site in a subdirectory), which
 * is what WordPress.com expects as `from_site_slug` when checking out without a site in context.
 */
export function getSiteSuffix(): string {
	return getInitialState()?.siteSuffix ?? '';
}

/**
 * Registers the site with WordPress.com and returns the URL that links the current user to a
 * WordPress.com account. Registration alone leaves the site connected but nobody signed in, so
 * every caller is expected to send the visitor on to this URL, sooner (the free plan) or later
 * (after checkout, via `connect_after_checkout`).
 *
 * Rejects with the REST API's own (already localized) message where there is one; callers are
 * expected to supply a translated fallback for the rest.
 *
 * @param redirectUri Admin path to return to once the user has authorized, relative to `admin_url()`.
 * @throws {Error} When the site prints no connection state, or the request fails.
 */
export async function registerSite( redirectUri: string ): Promise< string > {
	const state = getInitialState();

	if ( ! state?.apiRoot ) {
		throw new Error();
	}

	const response = await globalThis.fetch( `${ state.apiRoot }jetpack/v4/connection/register`, {
		method: 'POST',
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': state.apiNonce,
		},
		body: JSON.stringify( {
			// Dropped by the endpoint in jetpack-connection 6.7.0, still required before it. The
			// bundle is served from a CDN, so it can run against either.
			registration_nonce: state.registrationNonce,
			redirect_uri: redirectUri,
			// The sanctioned value for a new caller, per `client/jetpack-connect/AGENTS.md`. It is
			// also what returns the visitor to `redirect_uri`: an unrecognised `from` falls through
			// to Calypso's default target, which is the Jetpack plans page.
			from: 'jetpack-connector',
		} ),
	} );

	const body = await response.json().catch( () => null );

	if ( ! response.ok || ! body?.authorizeUrl ) {
		throw new Error( body?.message ?? '' );
	}

	return body.authorizeUrl;
}
