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
import { createActions } from '../actions';
import { STORE_KEY } from '../constants';

const client_id = 'magic_client_id';
const client_secret = 'magic_client_secret';

describe( 'submitUsernameOrEmail', () => {
	const { submitUsernameOrEmail } = createActions( {
		client_id,
		client_secret,
	} );

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
	const { submitPassword } = createActions( {
		client_id,
		client_secret,
		loadCookiesAfterLogin: false,
	} );

	it( 'logs in to remote services on successful login', async () => {
		const password = 'passw0rd';
		const generator = submitPassword( password );

		expect( generator.next().value ).toEqual( {
			type: 'CLEAR_ERRORS',
		} );

		// Implementation detail; needs to select username from store
		expect( generator.next().value ).toMatchObject( {
			type: '@@data/RESOLVE_SELECT',
			storeKey: STORE_KEY,
		} );

		const username = 'user1';
		const fetchAction = generator.next( username ).value;
		expect( fetchAction ).toEqual( {
			type: 'FETCH_AND_PARSE',
			resource: 'https://wordpress.com/wp-login.php?action=login-endpoint',
			options: expect.objectContaining( {
				method: 'POST',
				body: expect.stringMatching(
					RegExp(
						`^(?=.*username=${ username })(?=.*password=${ password })(?=.*client_id=${ client_id })(?=.*client_secret=${ client_secret }).*$`
					)
				),
			} ),
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
			type: '@@data/RESOLVE_SELECT',
			storeKey: STORE_KEY,
		} );

		const username = 'user1';
		const fetchAction = generator.next( username ).value;
		expect( fetchAction ).toEqual( {
			type: 'FETCH_AND_PARSE',
			resource: 'https://wordpress.com/wp-login.php?action=login-endpoint',
			options: expect.objectContaining( {
				method: 'POST',
				body: expect.stringMatching(
					RegExp(
						`^(?=.*username=${ username })(?=.*password=${ password })(?=.*client_id=${ client_id })(?=.*client_secret=${ client_secret }).*$`
					)
				),
			} ),
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

	it( 'stops polling 2fa when an error occurs', async () => {
		const password = 'passw0rd';
		const generator = submitPassword( password );

		expect( generator.next().value ).toEqual( {
			type: 'CLEAR_ERRORS',
		} );

		// Implementation detail; needs to select username from store
		expect( generator.next().value ).toMatchObject( {
			type: '@@data/RESOLVE_SELECT',
			storeKey: STORE_KEY,
		} );

		const username = 'user1';
		const fetchAction = generator.next( username ).value;
		expect( fetchAction ).toEqual( {
			type: 'FETCH_AND_PARSE',
			resource: 'https://wordpress.com/wp-login.php?action=login-endpoint',
			options: expect.objectContaining( {
				method: 'POST',
				body: expect.stringMatching(
					RegExp(
						`^(?=.*username=${ username })(?=.*password=${ password })(?=.*client_id=${ client_id })(?=.*client_secret=${ client_secret }).*$`
					)
				),
			} ),
		} );

		const authType = 'push';
		const userId = 113;
		const nonce = 'secret-nonce';
		const token = 'secret-token';
		const pushSentResponse = {
			success: true,
			data: {
				two_step_notification_sent: authType,
				user_id: userId,
				push_web_token: token,
				two_step_nonce_push: nonce,
			},
		};
		expect( generator.next( { ok: true, body: pushSentResponse } ).value ).toEqual( {
			type: 'RECEIVE_WP_LOGIN',
			response: pushSentResponse,
		} );

		expect( generator.next().value ).toEqual( {
			type: 'START_POLLING_TASK',
			pollingTaskId: 0,
		} );

		// Checking that the polling hasn't been canceled
		expect( generator.next().value ).toMatchObject( {
			type: '@@data/RESOLVE_SELECT',
			storeKey: STORE_KEY,
		} );

		expect( generator.next( 0 ).value ).toEqual( {
			type: 'FETCH_AND_PARSE',
			resource: 'https://wordpress.com/wp-login.php?action=two-step-authentication-endpoint',
			options: expect.objectContaining( {
				method: 'POST',
				body: expect.stringMatching(
					RegExp(
						`^(?=.*auth_type=${ authType })(?=.*user_id=${ userId })(?=.*two_step_nonce=${ nonce })(?=.*two_step_push_token=${ token }).*$`
					)
				),
			} ),
		} );

		const pollResponse = {
			success: false,
			data: {
				errors: [ { code: 'error-code', message: 'error-message' } ],
			},
		};
		expect( generator.next( { ok: false, body: pollResponse } ).value ).toEqual( {
			type: 'RECEIVE_WP_LOGIN_FAILED',
			response: pollResponse,
		} );

		expect( generator.next().done ).toBe( true );
	} );
} );
