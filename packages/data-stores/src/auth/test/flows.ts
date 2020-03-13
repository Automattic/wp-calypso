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
import { dispatch, select } from '@wordpress/data';
import { parse } from 'qs';
import wpcomRequest from 'wpcom-proxy-request';
import 'jest-fetch-mock';
import nock from 'nock';

/**
 * Internal dependencies
 */
import { register } from '..';

jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	requestAllBlogsAccess: jest.fn( () => Promise.resolve() ),
} ) );

let store: ReturnType< typeof register >;
beforeAll( () => {
	store = register( { client_id: '', client_secret: '', loadCookiesAfterLogin: false } );
} );

beforeEach( () => {
	dispatch( store ).reset();
	( wpcomRequest as jest.Mock ).mockReset();
} );

describe( 'password login flow', () => {
	it( 'logs in with correct credentials', async () => {
		const { getErrors, getLoginFlowState } = select( store );
		const { submitUsernameOrEmail, submitPassword } = dispatch( store );

		expect( getLoginFlowState() ).toBe( 'ENTER_USERNAME_OR_EMAIL' );

		( wpcomRequest as jest.Mock ).mockResolvedValue( {
			email_verified: true,
			passwordless: false,
		} );

		await submitUsernameOrEmail( 'user1' );

		expect( wpcomRequest ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				path: '/users/user1/auth-options',
			} )
		);

		expect( getLoginFlowState() ).toBe( 'ENTER_PASSWORD' );

		nock( 'https://wordpress.com' )
			.post( '/wp-login.php?action=login-endpoint', body => {
				expect( parse( body ) ).toEqual(
					expect.objectContaining( {
						username: 'user1',
						password: 'passw0rd',
						remember_me: 'true',
					} )
				);
				return true;
			} )
			.reply( 200, {
				success: true,
				data: { token_links: [] },
			} );

		await submitPassword( 'passw0rd' );

		expect( getLoginFlowState() ).toBe( 'LOGGED_IN' );
		expect( getErrors() ).toEqual( [] );
	} );

	it( 'errors for unknown users', async () => {
		const { getErrors, getLoginFlowState } = select( store );
		const { submitUsernameOrEmail } = dispatch( store );

		expect( getLoginFlowState() ).toBe( 'ENTER_USERNAME_OR_EMAIL' );

		( wpcomRequest as jest.Mock ).mockRejectedValue( {
			error: 'unknown_user',
			message: 'User does not exist',
		} );

		await submitUsernameOrEmail( 'unknown' );

		expect( wpcomRequest ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				path: '/users/unknown/auth-options',
			} )
		);

		expect( getLoginFlowState() ).toBe( 'ENTER_USERNAME_OR_EMAIL' );
		expect( getErrors() ).toEqual( [
			{
				code: 'unknown_user',
				message: 'User does not exist',
			},
		] );
	} );

	it( "doesn't log in with incorrect passord", async () => {
		const { getErrors, getLoginFlowState } = select( store );
		const { submitUsernameOrEmail, submitPassword } = dispatch( store );

		expect( getLoginFlowState() ).toBe( 'ENTER_USERNAME_OR_EMAIL' );

		( wpcomRequest as jest.Mock ).mockResolvedValue( {
			email_verified: true,
			passwordless: false,
		} );

		await submitUsernameOrEmail( 'user1' );

		expect( getLoginFlowState() ).toBe( 'ENTER_PASSWORD' );

		nock( 'https://wordpress.com' )
			.post( '/wp-login.php?action=login-endpoint', body => {
				expect( parse( body ) ).toEqual(
					expect.objectContaining( {
						username: 'user1',
						password: 'wrongpassword',
						remember_me: 'true',
					} )
				);
				return true;
			} )
			.reply( 400, {
				success: false,
				data: { errors: [ { code: 'incorrect_password', message: 'message for user' } ] },
			} );

		await submitPassword( 'wrongpassword' );

		expect( getLoginFlowState() ).toBe( 'ENTER_PASSWORD' );
		expect( getErrors() ).toEqual( [
			{
				code: 'incorrect_password',
				message: 'message for user',
			},
		] );
	} );

	it( 'logs in using mobile app for 2fa', async () => {
		const { getLoginFlowState } = select( store );
		const { submitUsernameOrEmail, submitPassword } = dispatch( store );

		expect( getLoginFlowState() ).toBe( 'ENTER_USERNAME_OR_EMAIL' );

		( wpcomRequest as jest.Mock ).mockResolvedValue( {
			email_verified: true,
			passwordless: false,
		} );

		await submitUsernameOrEmail( 'user1' );

		expect( wpcomRequest ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				path: '/users/user1/auth-options',
			} )
		);

		expect( getLoginFlowState() ).toBe( 'ENTER_PASSWORD' );

		const user_id = 12341234;
		const two_step_nonce = 'secretnonce';
		const two_step_push_token = 'push:token';

		nock( 'https://wordpress.com' )
			.post( '/wp-login.php?action=login-endpoint', body => {
				expect( parse( body ) ).toEqual(
					expect.objectContaining( {
						username: 'user1',
						password: 'passw0rd',
						remember_me: 'true',
					} )
				);
				return true;
			} )
			.reply( 200, {
				success: true,
				data: {
					user_id,
					two_step_supported_auth_types: [ 'push' ],
					two_step_notification_sent: 'push',
					two_step_nonce_push: two_step_nonce,
					push_web_token: two_step_push_token,
				},
			} )
			.post( '/wp-login.php?action=two-step-authentication-endpoint', body => {
				expect( parse( body ) ).toEqual(
					expect.objectContaining( {
						user_id: user_id.toString( 10 ),
						auth_type: 'push',
						two_step_nonce,
						two_step_push_token,
					} )
				);
				return true;
			} )
			.reply( 403, {
				success: false,
				data: {
					two_step_nonce,
					errors: [
						{
							code: 'invalid_two_step_code',
							message: 'Double check the app and try again',
						},
					],
				},
			} );

		await submitPassword( 'passw0rd' );

		expect( getLoginFlowState() ).toBe( 'WAITING_FOR_2FA_APP' );

		nock( 'https://wordpress.com' )
			.post( '/wp-login.php?action=two-step-authentication-endpoint', body => {
				expect( parse( body ) ).toEqual(
					expect.objectContaining( {
						user_id: user_id.toString( 10 ),
						auth_type: 'push',
						two_step_nonce,
						two_step_push_token,
					} )
				);
				return true;
			} )
			.reply( 200, {
				success: true,
				data: { token_links: [] },
			} );

		expect( getLoginFlowState() ).toBe( 'LOGGED_IN' );
	} );
} );

describe( 'passwordless login flow', () => {
	it( 'requests a login link to be sent', async () => {
		const { getLoginFlowState } = select( store );
		const { submitUsernameOrEmail } = dispatch( store );

		expect( getLoginFlowState() ).toBe( 'ENTER_USERNAME_OR_EMAIL' );

		( wpcomRequest as jest.Mock )
			.mockResolvedValueOnce( { email_verified: true, passwordless: true } )
			.mockResolvedValueOnce( { success: true } );

		await submitUsernameOrEmail( 'test@example.com' );

		expect( wpcomRequest ).toHaveBeenCalledTimes( 2 );

		expect( wpcomRequest ).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining( {
				path: '/users/test%40example.com/auth-options',
			} )
		);
		expect( wpcomRequest ).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining( {
				method: 'post',
				path: '/auth/send-login-email',
				body: expect.objectContaining( {
					lang_id: 1,
					locale: 'en',
					email: 'test@example.com',
				} ),
			} )
		);

		expect( getLoginFlowState() ).toBe( 'LOGIN_LINK_SENT' );
	} );

	it( 'reports error if login email fails to send', async () => {
		const { getFirstError, getLoginFlowState } = select( store );
		const { submitUsernameOrEmail } = dispatch( store );

		expect( getLoginFlowState() ).toBe( 'ENTER_USERNAME_OR_EMAIL' );

		( wpcomRequest as jest.Mock )
			.mockResolvedValueOnce( { email_verified: true, passwordless: true } )
			.mockRejectedValueOnce( {
				error: 'unauthorized',
				message: "You're not allowed to request a login link for this account.",
			} );

		await submitUsernameOrEmail( 'test@example.com' );

		expect( wpcomRequest ).toHaveBeenCalledTimes( 2 );

		expect( getLoginFlowState() ).toBe( 'ENTER_USERNAME_OR_EMAIL' );
		expect( getFirstError() ).toEqual( {
			code: 'unauthorized',
			message: "You're not allowed to request a login link for this account.",
		} );
	} );
} );
