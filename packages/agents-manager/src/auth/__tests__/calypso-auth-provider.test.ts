/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
jest.mock(
	'@automattic/oauth-token',
	() => ( {
		getToken: jest.fn( () => false ),
	} ),
	{ virtual: true }
);

jest.mock(
	'@wordpress/api-fetch',
	() => ( {
		__esModule: true,
		default: jest.fn(),
	} ),
	{ virtual: true }
);

jest.mock(
	'wpcom-proxy-request',
	() => ( {
		__esModule: true,
		default: jest.fn(),
		canAccessWpcomApis: jest.fn( () => false ),
	} ),
	{ virtual: true }
);

import * as oauthToken from '@automattic/oauth-token';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { createCalypsoAuthProvider } from '../calypso-auth-provider';

const mockApiFetch = apiFetch as unknown as jest.Mock;
const mockCanAccessWpcomApis = canAccessWpcomApis as jest.Mock;
const mockGetOAuthToken = oauthToken.getToken as jest.Mock;
const mockWpcomRequest = wpcomRequest as jest.Mock;

describe( 'createCalypsoAuthProvider JWT cache', () => {
	beforeEach( () => {
		mockApiFetch.mockReset();
		mockCanAccessWpcomApis.mockReset().mockReturnValue( false );
		mockGetOAuthToken.mockReset().mockReturnValue( false );
		mockWpcomRequest.mockReset();
		localStorage.clear();
		sessionStorage.clear();
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'reuses a token for the same user and site without writing it to browser storage', async () => {
		mockApiFetch.mockResolvedValue( { token: 'cached-token', blog_id: '4101' } );
		const auth = createCalypsoAuthProvider( 4101, { userId: 5101 } );

		await expect( auth() ).resolves.toMatchObject( { Authorization: 'cached-token' } );
		await expect( auth() ).resolves.toMatchObject( { Authorization: 'cached-token' } );

		expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );
		expect( sessionStorage ).toHaveLength( 0 );
	} );

	it( 'uses user B auth after a same-page account switch', async () => {
		mockApiFetch
			.mockResolvedValueOnce( { token: 'user-a-token', blog_id: '4102' } )
			.mockResolvedValueOnce( { token: 'user-b-token', blog_id: '4102' } );

		const userAAuth = createCalypsoAuthProvider( 4102, { userId: 5102 } );
		const userBAuth = createCalypsoAuthProvider( 4102, { userId: 5103 } );

		await expect( userAAuth() ).resolves.toMatchObject( { Authorization: 'user-a-token' } );
		await expect( userBAuth() ).resolves.toMatchObject( { Authorization: 'user-b-token' } );
		expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'does not reuse one site auth token for another site', async () => {
		mockApiFetch
			.mockResolvedValueOnce( { token: 'site-4103-token', blog_id: '4103' } )
			.mockResolvedValueOnce( { token: 'site-4104-token', blog_id: '4104' } );

		const siteAAuth = createCalypsoAuthProvider( 4103, { userId: 5104 } );
		const siteBAuth = createCalypsoAuthProvider( 4104, { userId: 5104 } );

		await expect( siteAAuth() ).resolves.toMatchObject( {
			Authorization: 'site-4103-token',
		} );
		await expect( siteBAuth() ).resolves.toMatchObject( {
			Authorization: 'site-4104-token',
		} );
		expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'refetches an expired token', async () => {
		const now = 1_000_000;
		const nowSpy = jest.spyOn( Date, 'now' ).mockReturnValue( now );
		mockApiFetch
			.mockResolvedValueOnce( { token: 'first-token', blog_id: '4105' } )
			.mockResolvedValueOnce( { token: 'fresh-token', blog_id: '4105' } );
		const auth = createCalypsoAuthProvider( 4105, { userId: 5105 } );

		await expect( auth() ).resolves.toMatchObject( { Authorization: 'first-token' } );
		nowSpy.mockReturnValue( now + 30 * 60 * 1000 + 1 );
		await expect( auth() ).resolves.toMatchObject( { Authorization: 'fresh-token' } );
		expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'applies the same user boundary to wpcomRequest JWTs', async () => {
		mockCanAccessWpcomApis.mockReturnValue( true );
		mockWpcomRequest
			.mockResolvedValueOnce( { token: 'user-a-token', blog_id: 4106 } )
			.mockResolvedValueOnce( { token: 'user-b-token', blog_id: 4106 } );

		const userAAuth = createCalypsoAuthProvider( 4106, { userId: 5106 } );
		const userBAuth = createCalypsoAuthProvider( 4106, { userId: 5107 } );

		await expect( userAAuth() ).resolves.toMatchObject( {
			Authorization: 'Bearer user-a-token',
		} );
		await expect( userAAuth() ).resolves.toMatchObject( {
			Authorization: 'Bearer user-a-token',
		} );
		await expect( userBAuth() ).resolves.toMatchObject( {
			Authorization: 'Bearer user-b-token',
		} );
		expect( mockWpcomRequest ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'ignores a JWT left in sessionStorage by the old cache', async () => {
		sessionStorage.setItem(
			'jetpack-ai-jwt-token',
			JSON.stringify( { token: 'legacy-token', expire: Date.now() + 60_000 } )
		);
		mockApiFetch.mockResolvedValue( { token: 'fresh-token', blog_id: '4107' } );

		const auth = createCalypsoAuthProvider( 4107, { userId: 5108 } );

		await expect( auth() ).resolves.toMatchObject( { Authorization: 'fresh-token' } );
		expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'caches within the page when the caller has no user identity', async () => {
		mockApiFetch.mockResolvedValue( { token: 'reader-token', blog_id: '4108' } );
		const auth = createCalypsoAuthProvider( 4108 );

		await expect( auth() ).resolves.toMatchObject( { Authorization: 'reader-token' } );
		await expect( auth() ).resolves.toMatchObject( { Authorization: 'reader-token' } );
		expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );
	} );
} );
