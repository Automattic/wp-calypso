/**
 * @jest-environment jsdom
 */
import { getConnectionStatus, getSiteSuffix, registerSite } from '../jetpack-connection';

const REDIRECT_URI = 'admin.php?page=stats';

const INITIAL_STATE = {
	apiRoot: 'https://example.com/wp-json/',
	apiNonce: 'api-nonce',
	registrationNonce: 'registration-nonce',
	connectionStatus: { isRegistered: false, isUserConnected: false, offlineMode: false },
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
	it( 'reports the printed connection status', () => {
		expect( getConnectionStatus() ).toEqual( INITIAL_STATE.connectionStatus );
		expect( getSiteSuffix() ).toBe( 'example.com' );
	} );

	it( 'reads as "nothing known" when Jetpack prints no state at all', () => {
		// An older Jetpack serving this bundle from the CDN does not print the blob.
		delete window.JP_CONNECTION_INITIAL_STATE;

		expect( getConnectionStatus() ).toEqual( {} );
		expect( getSiteSuffix() ).toBe( '' );
	} );
} );

describe( 'registerSite', () => {
	it( 'returns the authorization URL the site was given', async () => {
		globalThis.fetch = mockResponse( {
			body: { authorizeUrl: 'https://wordpress.com/authorize' },
		} );

		await expect( registerSite( REDIRECT_URI ) ).resolves.toBe( 'https://wordpress.com/authorize' );
	} );

	it( 'posts to the site itself, authenticated by the wp-admin session', async () => {
		globalThis.fetch = mockResponse( {
			body: { authorizeUrl: 'https://wordpress.com/authorize' },
		} );

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
			from: 'jetpack-stats',
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
