import { IncomingMessage } from 'http';
import config from '@automattic/calypso-config';
import nock from 'nock';
import getBootstrappedUser from '../index';

jest.mock( '@automattic/calypso-config', () => {
	const impl = jest.fn();
	impl.isEnabled = jest.fn();
	return impl;
} );

const mockRequest = ( { cookies = {}, headers = {} } = {} ) => {
	return Object.assign( new IncomingMessage(), {
		body: {},
		cookies,
		query: {},
		params: {},
		get: jest.fn().mockImplementation( ( key ) => headers[ key ] ),
	} );
};

const configureUpstreamRequest = ( {
	headers = {},
	response = { ID: '1' },
	respondWithError = false,
} = {} ) => {
	return nock( 'https://public-api.wordpress.com', {
		reqheaders: headers,
	} )
		.get( '/rest/v1/me?meta=flags' )
		.reply( respondWithError ? 500 : 200, response );
};

const withConfig = ( keys ) => {
	config.mockImplementation( ( key ) => keys[ key ] );
};

const withEnv = ( env = {} ) => {
	for ( const [ k, v ] of Object.entries( env ) ) {
		process.env[ k ] = v;
	}
};

describe( 'User bootstrap', () => {
	const realProcessEnv = { ...process.env };

	beforeEach( () => {
		// Default value for most tests. Some tests will overwrite this to simulate missing key
		withConfig( {
			wpcom_calypso_rest_api_key: 'key',
		} );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.resetAllMocks();
		for ( const [ env, value ] of Object.entries( realProcessEnv ) ) {
			process.env[ env ] = value;
		}
	} );

	it( 'throws if there is no auth cookie', async () => {
		const request = mockRequest( { cookies: {} } );

		await expect( getBootstrappedUser( request ) ).rejects.toThrow(
			new Error( 'Cannot bootstrap without an auth cookie' )
		);
	} );

	it( 'throws if there is supportSessionHeader and supportSessionCookie', async () => {
		const request = mockRequest( {
			cookies: {
				wordpress_logged_in: 'auth-cookie',
				support_session_id: 'session-id',
			},
			headers: {
				'x-support-session': 'session-id',
			},
		} );

		await expect( getBootstrappedUser( request ) ).rejects.toThrow(
			new Error( 'Cannot bootstrap with both a support session header and support session cookie.' )
		);
	} );

	it( 'sets the user agent in the upstream request', async () => {
		const upstreamRequest = configureUpstreamRequest( {
			headers: {
				'User-Agent': 'WordPress.com Calypso',
			},
		} );
		const request = mockRequest( {
			cookies: {
				wordpress_logged_in: 'auth-cookie',
			},
		} );

		await getBootstrappedUser( request );

		expect( upstreamRequest.isDone() ).toBe( true );
	} );

	it( 'sets the geo country code in the upstream request', async () => {
		const upstreamRequest = configureUpstreamRequest( {
			headers: {
				'X-Forwarded-GeoIP-Country-Code': 'es',
			},
		} );
		const request = mockRequest( {
			cookies: {
				wordpress_logged_in: 'auth-cookie',
			},
			headers: {
				'x-geoip-country-code': 'es',
			},
		} );

		await getBootstrappedUser( request );

		expect( upstreamRequest.isDone() ).toBe( true );
	} );

	it( 'sets the auth session cookie', async () => {
		const upstreamRequest = configureUpstreamRequest( {
			headers: {
				cookie: 'wordpress_logged_in=auth-cookie',
			},
		} );
		const request = mockRequest( {
			cookies: {
				wordpress_logged_in: 'auth-cookie',
			},
		} );

		await getBootstrappedUser( request );

		expect( upstreamRequest.isDone() ).toBe( true );
	} );

	it( 'sets the support session cookie', async () => {
		const upstreamRequest = configureUpstreamRequest( {
			headers: {
				cookie: ( val ) => val.includes( 'support_session_id=session-id' ),
			},
		} );
		const request = mockRequest( {
			cookies: {
				wordpress_logged_in: 'auth-cookie',
				support_session_id: 'session-id',
			},
		} );

		await getBootstrappedUser( request );

		expect( upstreamRequest.isDone() ).toBe( true );
	} );

	describe( 'with support session header', () => {
		let request;
		let upstreamRequest;

		beforeEach( () => {
			request = mockRequest( {
				cookies: {
					wordpress_logged_in: 'auth-cookie',
				},
				headers: {
					'x-support-session': 'session-id',
				},
			} );
			upstreamRequest = configureUpstreamRequest( {
				headers: {
					// Hardcoded value resulting from hashing "key" + "session-id"
					Authorization: 'X-WPCALYPSO-SUPPORT-SESSION bc8844a622734cad18a2ec733e11b296',
					'x-support-session': 'session-id',
				},
			} );
		} );

		it( 'throws if there is no support session API key', async () => {
			withConfig( {
				wpcom_calypso_support_session_rest_api_key: undefined,
			} );

			await expect( getBootstrappedUser( request ) ).rejects.toThrow(
				new Error(
					'Unable to boostrap user because of invalid SUPPORT SESSION API key in secrets.json'
				)
			);
		} );

		it( 'sets the authorization header', async () => {
			withConfig( {
				wpcom_calypso_support_session_rest_api_key: 'key',
			} );

			await getBootstrappedUser( request );

			expect( upstreamRequest.isDone() ).toBe( true );
		} );

		it( 'reads support session API key from env variables', async () => {
			withConfig( {
				wpcom_calypso_support_session_rest_api_key: undefined,
			} );
			withEnv( {
				WPCOM_CALYPSO_SUPPORT_SESSION_REST_API_KEY: 'key',
			} );

			await getBootstrappedUser( request );

			expect( upstreamRequest.isDone() ).toBe( true );
		} );

		it( 'support session API key from env variable overrides config', async () => {
			withConfig( {
				wpcom_calypso_support_session_rest_api_key: 'old_key',
			} );
			withEnv( {
				WPCOM_CALYPSO_SUPPORT_SESSION_REST_API_KEY: 'key',
			} );

			await getBootstrappedUser( request );

			expect( upstreamRequest.isDone() ).toBe( true );
		} );
	} );

	describe( 'with auth session', () => {
		let request;
		let upstreamRequest;

		beforeEach( () => {
			request = mockRequest( {
				cookies: {
					wordpress_logged_in: 'auth-cookie',
				},
			} );
			upstreamRequest = configureUpstreamRequest( {
				headers: {
					// Hardcoded value resulting from hashing "key" + "auth-cookie"
					Authorization: 'X-WPCALYPSO 26be6ad9e36fde3770b1e81a559db109',
				},
			} );
		} );

		it( 'throws if there is no API key', async () => {
			withConfig( {
				wpcom_calypso_rest_api_key: undefined,
			} );

			await expect( getBootstrappedUser( request ) ).rejects.toThrow(
				new Error( 'Unable to boostrap user because of invalid API key in secrets.json' )
			);
		} );

		it( 'sets the authorization header', async () => {
			withConfig( {
				wpcom_calypso_rest_api_key: 'key',
			} );

			await getBootstrappedUser( request );

			expect( upstreamRequest.isDone() ).toBe( true );
		} );

		it( 'reads API key from env variables', async () => {
			withConfig( {
				wpcom_calypso_rest_api_key: undefined,
			} );
			withEnv( {
				WPCOM_CALYPSO_REST_API_KEY: 'key',
			} );

			await getBootstrappedUser( request );

			expect( upstreamRequest.isDone() ).toBe( true );
		} );

		it( 'API key from env variable overrides config', async () => {
			withConfig( {
				wpcom_calypso_rest_api_key: 'old_key',
			} );
			withEnv( {
				WPCOM_CALYPSO_REST_API_KEY: 'key',
			} );

			await getBootstrappedUser( request );

			expect( upstreamRequest.isDone() ).toBe( true );
		} );
	} );

	it( 'returns the user from the response', async () => {
		configureUpstreamRequest( {
			response: {
				ID: '1',
				username: 'test',
			},
		} );

		const request = mockRequest( {
			cookies: {
				wordpress_logged_in: 'auth-cookie',
			},
		} );

		const user = await getBootstrappedUser( request );

		expect( user.ID ).toBe( '1' );
		expect( user.username ).toBe( 'test' );
	} );

	it( 'filters out invalid properties', async () => {
		configureUpstreamRequest( {
			response: {
				ID: '1',
				unknown_field: 'test',
			},
		} );

		const request = mockRequest( {
			cookies: {
				wordpress_logged_in: 'auth-cookie',
			},
		} );

		const user = await getBootstrappedUser( request );

		expect( user.unknown_field ).toBe( undefined );
	} );

	it( 'adds bootstrapped property to the response', async () => {
		const upstreamRequest = configureUpstreamRequest();

		const request = mockRequest( {
			cookies: {
				wordpress_logged_in: 'auth-cookie',
			},
		} );

		const user = await getBootstrappedUser( request );

		expect( upstreamRequest.isDone() ).toBe( true );
		expect( user.bootstrapped ).toBe( true );
	} );

	it( "throws if the request doesn't have a response", async () => {
		configureUpstreamRequest( {
			respondWithError: true,
		} );

		const request = mockRequest( {
			cookies: {
				wordpress_logged_in: 'auth-cookie',
			},
		} );

		await expect( getBootstrappedUser( request ) ).rejects.toThrow();
	} );
} );
