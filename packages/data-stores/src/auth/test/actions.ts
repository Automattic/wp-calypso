/*
 * These tests shouldn't require the jsdom environment,
 * but we're waiting for this PR to merge:
 * https://github.com/WordPress/gutenberg/pull/20486
 *
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { submitPassword, submitUsernameOrEmail } from '../actions';
import { STORE_KEY } from '../constants';

describe( 'submitUsernameOrEmail', () => {
	it( 'requests auth options for a username', () => {
		const username = 'user1';
		const generator = submitUsernameOrEmail( username );

		expect( generator.next().value ).toEqual( { type: 'CLEAR_ERRORS' } );

		const apiResponse = {
			success: true,
			data: { token_links: [] as string[] },
		};

		expect( generator.next().value ).toEqual( {
			type: 'WPCOM_REQUEST',
			request: expect.objectContaining( {
				path: `/users/${ username }/auth-options`,
			} ),
		} );

		expect( generator.next( apiResponse ).value ).toEqual( {
			type: 'RECEIVE_AUTH_OPTIONS',
			response: apiResponse,
			usernameOrEmail: username,
		} );
	} );

	it( 'escapes email addresses', () => {
		const generator = submitUsernameOrEmail( 'test@email.com' );

		expect( generator.next().value ).toEqual( { type: 'CLEAR_ERRORS' } );

		expect( generator.next().value ).toEqual( {
			type: 'WPCOM_REQUEST',
			request: expect.objectContaining( {
				path: '/users/test%40email.com/auth-options',
			} ),
		} );
	} );
} );

describe( 'submitPassword', () => {
	it( 'logins in to remote services on successful login', async () => {
		const password = 'passw0rd';
		const generator = submitPassword( password );

		expect( generator.next().value ).toEqual( {
			type: 'CLEAR_ERRORS',
		} );

		expect( generator.next().value ).toEqual( {
			type: 'SELECT_USERNAME_OR_EMAIL',
		} );

		const username = 'user1';
		expect( generator.next( username ).value ).toEqual( {
			type: 'FETCH_WP_LOGIN',
			action: 'login-endpoint',
			params: { username, password },
		} );

		const token_links = [ 'https://gravator.com?login-url', 'https://jetpack.com?login-url' ];

		expect(
			generator.next( { ok: true, body: { success: true, data: { token_links } } } ).value
		).toEqual( {
			type: 'REMOTE_LOGIN_USER',
			loginLinks: token_links,
		} );
	} );

	it( 'dispatches failed action if exception is thrown by fetch', async () => {
		const password = 'passw0rd';
		const generator = submitPassword( password );

		expect( generator.next().value ).toEqual( {
			type: 'CLEAR_ERRORS',
		} );

		// Implementation detail; needs to select username from store
		expect( generator.next().value ).toMatchObject( {
			type: 'SELECT',
			storeKey: STORE_KEY,
		} );

		const username = 'user1';
		expect( generator.next( username ).value ).toEqual( {
			type: 'FETCH_WP_LOGIN',
			action: 'login-endpoint',
			params: { username, password },
		} );

		const errorMessage = 'Error!!1';
		expect( generator.throw( new Error( errorMessage ) ).value ).toEqual( {
			type: 'RECEIVE_WP_LOGIN_FAILED',
			response: {
				success: false,
				data: {
					errors: [ { code: 'Error', message: 'Error!!1' } ],
				},
			},
		} );
	} );
} );
