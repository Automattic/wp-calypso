/**
 * OAuth authentication for Fediverse instances.
 *
 * Supports two flows:
 * 1. Mastodon-compatible: POST /api/v1/apps → /oauth/authorize → /oauth/token
 * 2. ActivityPub OAuth (RFC 8414): /.well-known/oauth-authorization-server → PKCE authorize → token
 *
 * The client auto-detects which flow the instance supports.
 */

const STORAGE_KEY = 'starter-packs-fedi-auth';

export interface FediAuthState {
	instance: string;
	authType: 'mastodon' | 'activitypub';
	// Mastodon OAuth fields
	clientId: string;
	clientSecret: string;
	// ActivityPub OAuth fields (PKCE)
	authorizationEndpoint?: string;
	tokenEndpoint?: string;
	introspectionEndpoint?: string;
	codeVerifier?: string;
	// Actor URL discovered during or after auth (e.g. from token response `me` field).
	actorUrl?: string;
	// Common
	accessToken?: string;
	packSlug?: string;
	action?: 'follow-all' | 'follow-single';
	accountHandle?: string;
}

/**
 * OAuth Authorization Server Metadata (RFC 8414).
 */
interface OAuthServerMetadata {
	issuer: string;
	authorization_endpoint: string;
	token_endpoint: string;
	registration_endpoint?: string;
	introspection_endpoint?: string;
	scopes_supported?: string[];
	code_challenge_methods_supported?: string[];
}

/**
 * Get the redirect URI for OAuth callbacks.
 */
function getRedirectUri(): string {
	return `${ window.location.origin }${ window.location.pathname }`;
}

/**
 * Store auth state in localStorage to survive the OAuth redirect.
 */
export function saveAuthState( state: FediAuthState ): void {
	localStorage.setItem( STORAGE_KEY, JSON.stringify( state ) );
}

/**
 * Retrieve stored auth state.
 */
export function getAuthState(): FediAuthState | null {
	const stored = localStorage.getItem( STORAGE_KEY );
	if ( ! stored ) {
		return null;
	}
	try {
		return JSON.parse( stored );
	} catch {
		return null;
	}
}

/**
 * Clear stored auth state.
 */
export function clearAuthState(): void {
	localStorage.removeItem( STORAGE_KEY );
}

/**
 * Check if we have a valid connection to an instance.
 */
export function getActiveConnection(): FediAuthState | null {
	const state = getAuthState();
	if ( state?.accessToken ) {
		return state;
	}
	return null;
}

// ── PKCE helpers ──

/**
 * Generate a cryptographically random code verifier for PKCE (RFC 7636).
 */
function generateCodeVerifier(): string {
	const array = new Uint8Array( 32 );
	crypto.getRandomValues( array );
	return base64UrlEncode( array );
}

/**
 * Derive the S256 code challenge from a code verifier.
 */
async function generateCodeChallenge( verifier: string ): Promise< string > {
	const encoder = new TextEncoder();
	const data = encoder.encode( verifier );
	const digest = await crypto.subtle.digest( 'SHA-256', data );
	return base64UrlEncode( new Uint8Array( digest ) );
}

/**
 * Base64url-encode a byte array (no padding).
 */
function base64UrlEncode( bytes: Uint8Array ): string {
	let binary = '';
	for ( const byte of bytes ) {
		binary += String.fromCharCode( byte );
	}
	return btoa( binary ).replace( /\+/g, '-' ).replace( /\//g, '_' ).replace( /=+$/, '' );
}

// ── Instance type detection ──

/**
 * Detect whether an instance supports Mastodon OAuth or ActivityPub OAuth (RFC 8414).
 *
 * Mastodon (and forks) also serve /.well-known/oauth-authorization-server, so we
 * cannot rely on that endpoint alone. Instead we check for the Mastodon API first:
 * if /api/v1/instance responds, it's Mastodon-compatible and we use the Mastodon
 * OAuth flow. Only if that fails do we try the standard ActivityPub OAuth metadata.
 */
async function detectInstanceType(
	instance: string
): Promise< { type: 'activitypub'; metadata: OAuthServerMetadata } | { type: 'mastodon' } > {
	// 1. Check for Mastodon-compatible API.
	try {
		const mastodonResponse = await fetch( `https://${ instance }/api/v1/instance`, {
			method: 'HEAD',
		} );
		if ( mastodonResponse.ok ) {
			return { type: 'mastodon' };
		}
	} catch {
		// Not Mastodon — continue.
	}

	// 2. Check for standard ActivityPub OAuth (RFC 8414).
	try {
		const response = await fetch( `https://${ instance }/.well-known/oauth-authorization-server`, {
			headers: { Accept: 'application/json' },
		} );
		if ( response.ok ) {
			const metadata: OAuthServerMetadata = await response.json();
			if ( metadata.authorization_endpoint && metadata.token_endpoint ) {
				return { type: 'activitypub', metadata };
			}
		}
	} catch {
		// Not available.
	}

	// 3. Default to Mastodon flow (will fail at app registration if not compatible).
	return { type: 'mastodon' };
}

// ── Mastodon OAuth ──

/**
 * Register an OAuth application on a Mastodon-compatible instance.
 */
async function registerMastodonApp(
	instance: string
): Promise< { clientId: string; clientSecret: string } > {
	const response = await fetch( `https://${ instance }/api/v1/apps`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify( {
			client_name: 'WordPress.com Starter Packs',
			redirect_uris: getRedirectUri(),
			scopes: 'read follow',
			website: window.location.origin,
		} ),
	} );

	if ( ! response.ok ) {
		throw new Error( `Failed to register app on ${ instance }` );
	}

	const data = await response.json();
	return {
		clientId: data.client_id,
		clientSecret: data.client_secret,
	};
}

/**
 * Start the Mastodon OAuth flow: register app, save state, redirect.
 */
async function startMastodonOAuthFlow(
	instance: string,
	packSlug: string,
	action: FediAuthState[ 'action' ],
	accountHandle?: string
): Promise< void > {
	const { clientId, clientSecret } = await registerMastodonApp( instance );

	saveAuthState( {
		instance,
		authType: 'mastodon',
		clientId,
		clientSecret,
		packSlug,
		action,
		accountHandle,
	} );

	const params = new URLSearchParams( {
		client_id: clientId,
		redirect_uri: getRedirectUri(),
		response_type: 'code',
		scope: 'read follow',
	} );

	window.location.href = `https://${ instance }/oauth/authorize?${ params.toString() }`;
}

/**
 * Complete the Mastodon OAuth flow by exchanging the code for a token.
 */
async function completeMastodonOAuthFlow(
	code: string,
	state: FediAuthState
): Promise< FediAuthState > {
	const response = await fetch( `https://${ state.instance }/oauth/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify( {
			client_id: state.clientId,
			client_secret: state.clientSecret,
			redirect_uri: getRedirectUri(),
			grant_type: 'authorization_code',
			code,
			scope: 'read follow',
		} ),
	} );

	if ( ! response.ok ) {
		clearAuthState();
		throw new Error( 'Failed to exchange authorization code for token.' );
	}

	const data = await response.json();
	const updatedState = { ...state, accessToken: data.access_token };
	saveAuthState( updatedState );
	return updatedState;
}

// ── ActivityPub OAuth (PKCE + Dynamic Client Registration) ──

/**
 * Register an OAuth client via RFC 7591 Dynamic Client Registration.
 * Returns the server-assigned client_id and optional client_secret.
 */
async function registerActivityPubClient(
	registrationEndpoint: string
): Promise< { clientId: string; clientSecret: string } > {
	const response = await fetch( registrationEndpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify( {
			client_name: 'WordPress.com Starter Packs',
			redirect_uris: [ getRedirectUri() ],
			scope: 'read write follow',
			website: window.location.origin,
		} ),
	} );

	if ( ! response.ok ) {
		throw new Error( `Dynamic client registration failed: ${ response.status }` );
	}

	const data = await response.json();
	return {
		clientId: data.client_id,
		clientSecret: data.client_secret || '',
	};
}

/**
 * Start the ActivityPub OAuth flow with PKCE and dynamic client registration.
 *
 * Uses the registration_endpoint from the OAuth server metadata (RFC 7591) to
 * obtain a proper client_id. This avoids the server needing to fetch a Client ID
 * Metadata Document from our URL, which fails in local/Docker setups.
 */
async function startActivityPubOAuthFlow(
	instance: string,
	metadata: OAuthServerMetadata,
	packSlug: string,
	action: FediAuthState[ 'action' ],
	accountHandle?: string
): Promise< void > {
	const codeVerifier = generateCodeVerifier();
	const codeChallenge = await generateCodeChallenge( codeVerifier );

	// Register a client dynamically if the server supports it (preferred).
	// Falls back to using the app origin as client_id for servers without registration.
	let clientId: string;
	let clientSecret = '';

	if ( metadata.registration_endpoint ) {
		const registered = await registerActivityPubClient( metadata.registration_endpoint );
		clientId = registered.clientId;
		clientSecret = registered.clientSecret;
	} else {
		clientId = window.location.origin;
	}

	saveAuthState( {
		instance,
		authType: 'activitypub',
		clientId,
		clientSecret,
		authorizationEndpoint: metadata.authorization_endpoint,
		tokenEndpoint: metadata.token_endpoint,
		introspectionEndpoint: metadata.introspection_endpoint,
		codeVerifier,
		packSlug,
		action,
		accountHandle,
	} );

	const params = new URLSearchParams( {
		client_id: clientId,
		redirect_uri: getRedirectUri(),
		response_type: 'code',
		scope: 'read write follow',
		code_challenge: codeChallenge,
		code_challenge_method: 'S256',
	} );

	window.location.href = `${ metadata.authorization_endpoint }?${ params.toString() }`;
}

/**
 * Complete the ActivityPub OAuth flow by exchanging the code with PKCE verifier.
 */
async function completeActivityPubOAuthFlow(
	code: string,
	state: FediAuthState
): Promise< FediAuthState > {
	if ( ! state.tokenEndpoint || ! state.codeVerifier ) {
		clearAuthState();
		throw new Error( 'Missing OAuth state for ActivityPub flow.' );
	}

	const body = new URLSearchParams( {
		client_id: state.clientId,
		redirect_uri: getRedirectUri(),
		grant_type: 'authorization_code',
		code,
		code_verifier: state.codeVerifier,
	} );

	const response = await fetch( state.tokenEndpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: body.toString(),
	} );

	if ( ! response.ok ) {
		clearAuthState();
		throw new Error( 'Failed to exchange authorization code for token.' );
	}

	const data = await response.json();
	const updatedState = {
		...state,
		accessToken: data.access_token,
		// Some servers return the actor URL in the token response (IndieAuth `me` field).
		actorUrl: data.me || data.actor || state.actorUrl,
		codeVerifier: undefined, // No longer needed
	};
	saveAuthState( updatedState );
	return updatedState;
}

// ── Public API ──

/**
 * Start the OAuth flow: auto-detects instance type (ActivityPub vs Mastodon).
 */
export async function startOAuthFlow(
	instance: string,
	packSlug: string,
	action: FediAuthState[ 'action' ] = 'follow-all',
	accountHandle?: string
): Promise< void > {
	const normalized = instance
		.trim()
		.replace( /^https?:\/\//, '' )
		.replace( /\/+$/, '' );

	// Check if we already have a valid token for this instance.
	const existing = getAuthState();
	if ( existing?.instance === normalized && existing?.accessToken ) {
		// Update the action intent and return — caller can proceed with follows.
		saveAuthState( { ...existing, packSlug, action, accountHandle } );
		return;
	}

	// Detect instance type and start the appropriate flow.
	const detected = await detectInstanceType( normalized );

	if ( detected.type === 'activitypub' ) {
		return startActivityPubOAuthFlow(
			normalized,
			detected.metadata,
			packSlug,
			action,
			accountHandle
		);
	}

	return startMastodonOAuthFlow( normalized, packSlug, action, accountHandle );
}

/**
 * Complete the OAuth flow by exchanging the authorization code for a token.
 * Auto-detects the auth type from stored state.
 */
export async function completeOAuthFlow( code: string ): Promise< FediAuthState > {
	const state = getAuthState();
	if ( ! state ) {
		throw new Error( 'No auth state found — OAuth flow was not started.' );
	}

	if ( state.authType === 'activitypub' ) {
		return completeActivityPubOAuthFlow( code, state );
	}

	return completeMastodonOAuthFlow( code, state );
}

/**
 * Check if the current URL contains an OAuth callback code.
 */
export function getOAuthCallbackCode(): string | null {
	const params = new URLSearchParams( window.location.search );
	return params.get( 'code' );
}

/**
 * Clean OAuth params from the URL without triggering navigation.
 */
export function cleanOAuthParams(): void {
	const url = new URL( window.location.href );
	url.searchParams.delete( 'code' );
	url.searchParams.delete( 'state' );
	window.history.replaceState( {}, '', url.toString() );
}
