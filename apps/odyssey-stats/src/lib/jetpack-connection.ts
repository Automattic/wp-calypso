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

interface Registration {
	/** Links the current user to a WordPress.com account. */
	authorizeUrl: string;
	/**
	 * The blog id WordPress.com just assigned, read off the authorization URL's `client_id`. It is
	 * the first identifier this site has ever had, and the only key that ties what happened before
	 * registration — where events can be keyed by nothing but the site suffix — to everything
	 * after. `null` if the URL carries no usable one; the site's own Jetpack builds it.
	 */
	blogId: number | null;
}

/**
 * Why registration failed. The message cannot answer that: the REST API returns it already
 * translated, it can name the site, and the failures that do not come from the API carry none at
 * all — so only a code is worth recording.
 */
export type RegistrationErrorCode =
	| 'no_connection_state'
	| 'request_failed'
	| 'http_error'
	| 'no_authorize_url';

interface RegistrationError extends Error {
	code: RegistrationErrorCode;
}

function registrationError( code: RegistrationErrorCode, message = '' ): RegistrationError {
	return Object.assign( new Error( message ), { code } );
}

/** Reads the code off a {@link registerSite} rejection; anything else is a request that never completed. */
export function getRegistrationErrorCode( error: unknown ): RegistrationErrorCode {
	return ( error as Partial< RegistrationError > | null )?.code ?? 'request_failed';
}

/**
 * Registers the site with WordPress.com. Registration alone leaves the site connected but nobody
 * signed in, so every caller is expected to send the visitor on to `authorizeUrl`, sooner (the
 * free plan) or later (after checkout, via `connect_after_checkout`).
 *
 * Rejects with the REST API's own (already localized) message where there is one; callers are
 * expected to supply a translated fallback for the rest, and to report the rejection's
 * {@link getRegistrationErrorCode} rather than its message.
 * @param redirectUri Admin path to return to once the user has authorized, relative to `admin_url()`.
 * @throws {RegistrationError} When the site prints no connection state, or the request fails.
 */
export async function registerSite( redirectUri: string ): Promise< Registration > {
	const state = getInitialState();

	if ( ! state?.apiRoot ) {
		throw registrationError( 'no_connection_state' );
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

	if ( ! response.ok ) {
		throw registrationError( 'http_error', body?.message ?? '' );
	}

	if ( ! body?.authorizeUrl ) {
		throw registrationError( 'no_authorize_url', body?.message ?? '' );
	}

	return { authorizeUrl: body.authorizeUrl, blogId: readBlogId( body.authorizeUrl ) };
}

function readBlogId( authorizeUrl: string ): number | null {
	try {
		const clientId = Number( new URL( authorizeUrl ).searchParams.get( 'client_id' ) );

		return Number.isInteger( clientId ) && clientId > 0 ? clientId : null;
	} catch {
		return null;
	}
}
