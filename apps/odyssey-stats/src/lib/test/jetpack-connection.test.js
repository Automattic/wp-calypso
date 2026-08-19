/**
 * @jest-environment jsdom
 */
import { getSiteSuffix, isOfflineMode, registerSite } from '../jetpack-connection';

const REDIRECT_URI = 'admin.php?page=stats';

const INITIAL_STATE = {
	apiRoot: 'https://example.com/wp-json/',
	apiNonce: 'api-nonce',
	registrationNonce: 'registration-nonce',
	// Verbatim from `Connection\Initial_State`: `connectionStatus.offlineMode` is an object
	// describing which signal fired, so only the top-level flag answers the question.
	connectionStatus: {
		isRegistered: false,
		isUserConnected: false,
		offlineMode: { isActive: false, constant: false, url: false, filter: false },
	},
	isOfflineMode: false,
	siteSuffix: 'example.com',
};

const mockResponse = ( { ok = true, body = {} } = {} ) =>
	jest.fn().mockResolvedValue( { ok, json: () => Promise.resolve( body ) } );

beforeEach( () => {
	window.JP_CONNECTION_INITIAL_STATE = { ...INITIAL_STATE };
} );

afterEach( () => {
	delete window.JP_CONNECTION_INITIAL_STATE;
	delete globalThis.fetch;
} );

describe( 'connection state readers', () => {
	it( 'reports the printed connection state', () => {
		expect( getSiteSuffix() ).toBe( 'example.com' );
		expect( isOfflineMode() ).toBe( false );
	} );

	it( 'reads a site that really is offline as offline', () => {
		window.JP_CONNECTION_INITIAL_STATE.isOfflineMode = true;

		expect( isOfflineMode() ).toBe( true );
	} );

	it( 'does not mistake the offline-mode detail object for the answer', () => {
		// It is always present and always truthy, including on a site that is perfectly online.
		expect( window.JP_CONNECTION_INITIAL_STATE.connectionStatus.offlineMode ).toBeTruthy();

		expect( isOfflineMode() ).toBe( false );
	} );

	it( 'reads as "nothing known" when Jetpack prints no state at all', () => {
		// An older Jetpack serving this bundle from the CDN does not print the blob.
		delete window.JP_CONNECTION_INITIAL_STATE;

		expect( getSiteSuffix() ).toBe( '' );
		expect( isOfflineMode() ).toBe( false );
	} );
} );

const AUTHORIZE_URL = 'https://wordpress.com/jetpack/connect/authorize?client_id=123456789';

describe( 'registerSite', () => {
	it( 'returns the authorization URL the site was given, and the blog id it names', async () => {
		globalThis.fetch = mockResponse( { body: { authorizeUrl: AUTHORIZE_URL } } );

		await expect( registerSite( REDIRECT_URI ) ).resolves.toEqual( {
			authorizeUrl: AUTHORIZE_URL,
			blogId: 123456789,
		} );
	} );

	it.each( [
		[ 'carries no client id', 'https://wordpress.com/jetpack/connect/authorize' ],
		[ 'carries one that is not a number', 'https://wordpress.com/authorize?client_id=nonsense' ],
		[ 'is not a URL at all', 'not-a-url' ],
	] )( 'reports no blog id when the authorization URL %s', async ( _label, authorizeUrl ) => {
		globalThis.fetch = mockResponse( { body: { authorizeUrl } } );

		await expect( registerSite( REDIRECT_URI ) ).resolves.toEqual( { authorizeUrl, blogId: null } );
	} );

	it( 'posts to the site itself, authenticated by the wp-admin session', async () => {
		globalThis.fetch = mockResponse( { body: { authorizeUrl: AUTHORIZE_URL } } );

		await registerSite( REDIRECT_URI );

		const [ url, options ] = globalThis.fetch.mock.calls[ 0 ];
		expect( url ).toBe( 'https://example.com/wp-json/jetpack/v4/connection/register' );
		expect( options ).toMatchObject( {
			method: 'POST',
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': 'api-nonce' },
		} );
		expect( JSON.parse( options.body ) ).toEqual( {
			registration_nonce: 'registration-nonce',
			redirect_uri: REDIRECT_URI,
			from: 'jetpack-connector',
		} );
	} );

	it( 'rejects with the REST API message when the request fails', async () => {
		globalThis.fetch = mockResponse( {
			ok: false,
			body: { message: 'You are not allowed to connect this site.' },
		} );

		await expect( registerSite( REDIRECT_URI ) ).rejects.toThrow(
			'You are not allowed to connect this site.'
		);
	} );

	it( 'rejects when the response carries no authorization URL', async () => {
		// Nothing to send the visitor to means the connection cannot be completed, however
		// successful the response looked.
		globalThis.fetch = mockResponse( { body: {} } );

		await expect( registerSite( REDIRECT_URI ) ).rejects.toThrow( Error );
	} );

	it( 'rejects on a response that is not JSON', async () => {
		globalThis.fetch = jest
			.fn()
			.mockResolvedValue( { ok: true, json: () => Promise.reject( new Error( 'not JSON' ) ) } );

		await expect( registerSite( REDIRECT_URI ) ).rejects.toThrow( Error );
	} );

	it( 'rejects without a request when the site prints no connection state', async () => {
		delete window.JP_CONNECTION_INITIAL_STATE;
		globalThis.fetch = mockResponse();

		await expect( registerSite( REDIRECT_URI ) ).rejects.toThrow( Error );
		expect( globalThis.fetch ).not.toHaveBeenCalled();
	} );
} );
