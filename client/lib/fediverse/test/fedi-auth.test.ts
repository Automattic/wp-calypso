/**
 * @jest-environment jsdom
 */

import {
	clearAuthState,
	completeOAuthFlow,
	getAuthState,
	getOAuthCallbackCode,
	getOAuthCallbackError,
	getOAuthCallbackState,
	saveAuthState,
	startOAuthFlow,
} from '../fedi-auth';

type LocationAssignment = { href: string };

function captureLocationHrefAssignments(): LocationAssignment {
	// jsdom prevents setting window.location.href directly; redefine it.
	const captured: LocationAssignment = { href: '' };
	const originalLocation = window.location;
	Object.defineProperty( window, 'location', {
		configurable: true,
		value: {
			origin: 'https://example.test',
			pathname: '/reader',
			search: '',
			href: '',
		},
	} );
	Object.defineProperty( window.location, 'href', {
		configurable: true,
		set( value: string ) {
			captured.href = value;
		},
		get() {
			return captured.href;
		},
	} );
	// Restore after each test via afterEach.
	( captureLocationHrefAssignments as unknown as { restore: () => void } ).restore = () => {
		Object.defineProperty( window, 'location', {
			configurable: true,
			value: originalLocation,
		} );
	};
	return captured;
}

function setLocationSearch( search: string ): void {
	Object.defineProperty( window, 'location', {
		configurable: true,
		value: {
			origin: 'https://example.test',
			pathname: '/reader',
			search,
			href: `https://example.test/reader${ search }`,
		},
	} );
}

describe( 'fedi-auth OAuth URL builders', () => {
	let location: LocationAssignment;

	beforeEach( () => {
		clearAuthState();
		location = captureLocationHrefAssignments();
	} );

	afterEach( () => {
		clearAuthState();
		( captureLocationHrefAssignments as unknown as { restore: () => void } ).restore();
		jest.restoreAllMocks();
	} );

	test( 'Mastodon flow: authorize URL includes a random state param that matches stored state', async () => {
		// Mock detectInstanceType -> Mastodon (HEAD /api/v1/instance returns ok)
		// and registerMastodonApp (POST /api/v1/apps returns creds).
		const fetchMock = jest.fn( async ( url: string, options?: RequestInit ) => {
			if ( url.endsWith( '/api/v1/instance' ) && options?.method === 'HEAD' ) {
				return { ok: true } as Response;
			}
			if ( url.endsWith( '/api/v1/apps' ) ) {
				return {
					ok: true,
					json: async () => ( { client_id: 'cid', client_secret: 'csec' } ),
				} as Response;
			}
			throw new Error( `Unexpected fetch: ${ url }` );
		} );
		global.fetch = fetchMock as unknown as typeof fetch;

		await startOAuthFlow( 'mastodon.social', 'my-list' );

		const stored = getAuthState();
		expect( stored ).not.toBeNull();
		expect( stored?.authType ).toBe( 'mastodon' );
		expect( stored?.oauthState ).toMatch( /^[A-Za-z0-9_-]+$/ );

		const authorizeUrl = new URL( location.href );
		expect( authorizeUrl.origin + authorizeUrl.pathname ).toBe(
			'https://mastodon.social/oauth/authorize'
		);
		expect( authorizeUrl.searchParams.get( 'state' ) ).toBe( stored?.oauthState );
		expect( authorizeUrl.searchParams.get( 'client_id' ) ).toBe( 'cid' );
		expect( authorizeUrl.searchParams.get( 'response_type' ) ).toBe( 'code' );
	} );

	test( 'ActivityPub flow: authorize URL carries state + S256 PKCE challenge derived from stored verifier', async () => {
		const metadata = {
			issuer: 'https://ap.example',
			authorization_endpoint: 'https://ap.example/authorize',
			token_endpoint: 'https://ap.example/token',
			registration_endpoint: 'https://ap.example/register',
		};

		const fetchMock = jest.fn( async ( url: string, options?: RequestInit ) => {
			if ( url.endsWith( '/api/v1/instance' ) && options?.method === 'HEAD' ) {
				return { ok: false } as Response;
			}
			if ( url.endsWith( '/.well-known/oauth-authorization-server' ) ) {
				return { ok: true, json: async () => metadata } as Response;
			}
			if ( url === metadata.registration_endpoint ) {
				return {
					ok: true,
					json: async () => ( { client_id: 'ap-cid', client_secret: '' } ),
				} as Response;
			}
			throw new Error( `Unexpected fetch: ${ url }` );
		} );
		global.fetch = fetchMock as unknown as typeof fetch;

		await startOAuthFlow( 'ap.example', 'my-list' );

		const stored = getAuthState();
		expect( stored?.authType ).toBe( 'activitypub' );
		expect( stored?.codeVerifier ).toBeDefined();
		expect( stored?.oauthState ).toMatch( /^[A-Za-z0-9_-]+$/ );

		const authorizeUrl = new URL( location.href );
		expect( authorizeUrl.origin + authorizeUrl.pathname ).toBe( metadata.authorization_endpoint );
		expect( authorizeUrl.searchParams.get( 'state' ) ).toBe( stored?.oauthState );
		expect( authorizeUrl.searchParams.get( 'code_challenge_method' ) ).toBe( 'S256' );

		// Challenge should be the base64url-encoded SHA-256 of the verifier.
		const verifier = stored!.codeVerifier!;
		const digest = await crypto.subtle.digest( 'SHA-256', new TextEncoder().encode( verifier ) );
		const bytes = new Uint8Array( digest );
		let binary = '';
		for ( const byte of bytes ) {
			binary += String.fromCharCode( byte );
		}
		const expectedChallenge = btoa( binary )
			.replace( /\+/g, '-' )
			.replace( /\//g, '_' )
			.replace( /=+$/, '' );

		expect( authorizeUrl.searchParams.get( 'code_challenge' ) ).toBe( expectedChallenge );
	} );
} );

describe( 'completeOAuthFlow state verification', () => {
	beforeEach( () => {
		clearAuthState();
	} );

	afterEach( () => {
		clearAuthState();
	} );

	test( 'rejects when returned state does not match stored state', async () => {
		saveAuthState( {
			instance: 'mastodon.social',
			authType: 'mastodon',
			clientId: 'cid',
			clientSecret: 'csec',
			oauthState: 'expected-state',
		} );

		await expect( completeOAuthFlow( 'any-code', 'attacker-state' ) ).rejects.toThrow(
			/state mismatch/i
		);
		// Auth state must be wiped after a mismatch.
		expect( getAuthState() ).toBeNull();
	} );

	test( 'rejects when no state is returned but one was issued', async () => {
		saveAuthState( {
			instance: 'mastodon.social',
			authType: 'mastodon',
			clientId: 'cid',
			clientSecret: 'csec',
			oauthState: 'expected-state',
		} );

		await expect( completeOAuthFlow( 'any-code', null ) ).rejects.toThrow( /state mismatch/i );
	} );
} );

describe( 'OAuth callback URL helpers', () => {
	afterEach( () => {
		setLocationSearch( '' );
	} );

	test( 'getOAuthCallbackCode returns the code when present', () => {
		setLocationSearch( '?code=abc123&state=xyz' );
		expect( getOAuthCallbackCode() ).toBe( 'abc123' );
		expect( getOAuthCallbackState() ).toBe( 'xyz' );
		expect( getOAuthCallbackError() ).toBeNull();
	} );

	test( 'getOAuthCallbackError returns parsed error with description', () => {
		setLocationSearch( '?error=access_denied&error_description=User%20said%20no' );
		expect( getOAuthCallbackError() ).toEqual( {
			error: 'access_denied',
			errorDescription: 'User said no',
		} );
	} );

	test( 'getOAuthCallbackError returns plain error without description', () => {
		setLocationSearch( '?error=server_error' );
		expect( getOAuthCallbackError() ).toEqual( { error: 'server_error' } );
	} );

	test( 'returns null when no OAuth params present', () => {
		setLocationSearch( '' );
		expect( getOAuthCallbackCode() ).toBeNull();
		expect( getOAuthCallbackState() ).toBeNull();
		expect( getOAuthCallbackError() ).toBeNull();
	} );
} );
