/*
 * These tests shouldn't require the jsdom environment,
 * but we're waiting for this PR to merge:
 * https://github.com/WordPress/gutenberg/pull/20486
 *
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import wpcomRequest, { reloadProxy } from 'wpcom-proxy-request';
import 'jest-fetch-mock';
import nock from 'nock';

/**
 * Internal dependencies
 */
import { createControls } from '../controls';

jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	requestAllBlogsAccess: jest.fn( () => Promise.resolve() ),
	reloadProxy: jest.fn(),
} ) );

beforeEach( () => {
	( reloadProxy as jest.Mock ).mockReset();
} );

describe( 'FETCH_AUTH_OPTIONS', () => {
	const { FETCH_AUTH_OPTIONS } = createControls( {
		client_id: '',
		client_secret: '',
		loadCookiesAfterLogin: true,
	} );

	it( 'requests auth options for a username', async () => {
		const apiResponse = {
			success: true,
			data: { token_links: [] },
		};
		( wpcomRequest as jest.Mock ).mockResolvedValue( apiResponse );

		const result = await FETCH_AUTH_OPTIONS( {
			type: 'FETCH_AUTH_OPTIONS',
			usernameOrEmail: 'user1',
		} );

		expect( result ).toEqual( apiResponse );

		expect( wpcomRequest ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				path: '/users/user1/auth-options',
			} )
		);
	} );

	it( 'escapes email addresses', async () => {
		await FETCH_AUTH_OPTIONS( {
			type: 'FETCH_AUTH_OPTIONS',
			usernameOrEmail: 'test@email.com',
		} );

		expect( wpcomRequest ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				path: '/users/test%40email.com/auth-options',
			} )
		);
	} );
} );

describe( 'FETCH_WP_LOGIN', () => {
	it( 'reloads the proxy after a successful login (loadCookiesAfterLogin === true)', async () => {
		const { FETCH_WP_LOGIN } = createControls( {
			client_id: '',
			client_secret: '',
			loadCookiesAfterLogin: true,
		} );

		nock( 'https://wordpress.com' )
			.post( '/wp-login.php?action=login-endpoint' )
			.reply( 200, {
				success: true,
				data: { token_links: [] },
			} );

		await FETCH_WP_LOGIN( {
			type: 'FETCH_WP_LOGIN',
			action: 'login-endpoint',
			params: {},
		} );

		expect( reloadProxy ).toHaveBeenCalled();
	} );

	it( "doesn't reload the proxy after an unsuccessful login (loadCookiesAfterLogin === true)", async () => {
		const { FETCH_WP_LOGIN } = createControls( {
			client_id: '',
			client_secret: '',
			loadCookiesAfterLogin: true,
		} );

		nock( 'https://wordpress.com' )
			.post( '/wp-login.php?action=login-endpoint' )
			.reply( 400, {
				success: false,
				data: { errors: [] },
			} );

		await FETCH_WP_LOGIN( {
			type: 'FETCH_WP_LOGIN',
			action: 'login-endpoint',
			params: {},
		} );

		expect( reloadProxy ).not.toHaveBeenCalled();
	} );

	it( "doesn't reload the proxy after a successful login (loadCookiesAfterLogin === false)", async () => {
		const { FETCH_WP_LOGIN } = createControls( {
			client_id: '',
			client_secret: '',
			loadCookiesAfterLogin: false,
		} );

		nock( 'https://wordpress.com' )
			.post( '/wp-login.php?action=login-endpoint' )
			.reply( 200, {
				success: true,
				data: { token_links: [] },
			} );

		await FETCH_WP_LOGIN( {
			type: 'FETCH_WP_LOGIN',
			action: 'login-endpoint',
			params: {},
		} );

		expect( reloadProxy ).not.toHaveBeenCalled();
	} );
} );
