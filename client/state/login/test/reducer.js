import {
	LOGIN_REQUEST,
	LOGIN_REQUEST_FAILURE,
	LOGIN_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_UPDATE_NONCE,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS,
	SOCIAL_LOGIN_REQUEST,
	SOCIAL_LOGIN_REQUEST_FAILURE,
	SOCIAL_LOGIN_REQUEST_SUCCESS,
	SOCIAL_CONNECT_ACCOUNT_REQUEST,
	SOCIAL_CONNECT_ACCOUNT_REQUEST_FAILURE,
	SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS,
	SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE,
	ROUTE_SET,
	CURRENT_USER_RECEIVE,
} from 'calypso/state/action-types';
import reducer, {
	isRequesting,
	isFormDisabled,
	requestError,
	requestNotice,
	requestSuccess,
	twoFactorAuth,
	twoFactorAuthRequestError,
	socialAccount,
	socialAccountLink,
} from '../reducer';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [
				'authAccountType',
				'isFormDisabled',
				'isRequesting',
				'lastCheckedUsernameOrEmail',
				'magicLogin',
				'redirectTo',
				'requestError',
				'requestNotice',
				'requestSuccess',
				'socialAccount',
				'socialAccountLink',
				'twoFactorAuth',
				'twoFactorAuthRequestError',
			] )
		);
	} );

	describe( 'isRequesting', () => {
		test( 'should default to a false', () => {
			const state = isRequesting( undefined, {} );

			expect( state ).toBe( false );
		} );

		test( 'should set isRequesting to true value if a request is initiated', () => {
			let state = isRequesting( undefined, {
				type: LOGIN_REQUEST,
			} );

			expect( state ).toBe( true );

			state = isRequesting( undefined, {
				type: SOCIAL_LOGIN_REQUEST,
			} );

			expect( state ).toBe( true );
		} );

		test( 'should set isRequesting to false value if a request was unsuccessful', () => {
			let state = isRequesting( undefined, {
				type: LOGIN_REQUEST_FAILURE,
			} );

			expect( state ).toBe( false );

			state = isRequesting( undefined, {
				type: SOCIAL_LOGIN_REQUEST_FAILURE,
			} );

			expect( state ).toBe( false );
		} );

		test( 'should set isRequesting to false value if a request was successful', () => {
			let state = isRequesting( undefined, {
				type: LOGIN_REQUEST_SUCCESS,
			} );

			expect( state ).toBe( false );

			state = isRequesting( undefined, {
				type: SOCIAL_LOGIN_REQUEST_SUCCESS,
			} );

			expect( state ).toBe( false );
		} );

		test( 'should set isFormDisabled to true value if a request is initiated', () => {
			let state = isFormDisabled( undefined, {
				type: LOGIN_REQUEST,
			} );

			expect( state ).toBe( true );

			state = isFormDisabled( undefined, {
				type: SOCIAL_LOGIN_REQUEST,
			} );

			expect( state ).toBe( true );
		} );

		test( 'should set isFormDisabled to false value if a request was unsuccessful', () => {
			let state = isFormDisabled( undefined, {
				type: LOGIN_REQUEST_FAILURE,
			} );

			expect( state ).toBe( false );

			state = isFormDisabled( undefined, {
				type: SOCIAL_LOGIN_REQUEST_FAILURE,
			} );

			expect( state ).toBe( false );
		} );

		test( 'should set isFormDisabled to true value if a request was successful', () => {
			let state = isFormDisabled( undefined, {
				type: LOGIN_REQUEST_SUCCESS,
			} );

			expect( state ).toBe( true );

			state = isFormDisabled( undefined, {
				type: SOCIAL_LOGIN_REQUEST_SUCCESS,
			} );

			expect( state ).toBe( true );
		} );
	} );

	describe( 'requestError', () => {
		test( 'should default to a null', () => {
			const state = requestError( undefined, {} );

			expect( state ).toBeNull();
		} );

		test( 'should set requestError to null value if a request is initiated', () => {
			let state = requestError( 'some error', {
				type: LOGIN_REQUEST,
			} );

			expect( state ).toBeNull();

			state = requestError( 'some error', {
				type: SOCIAL_CONNECT_ACCOUNT_REQUEST,
			} );

			expect( state ).toBeNull();
		} );

		test( 'should set requestError to null value if a request was successful', () => {
			let state = requestError( 'some error', {
				type: LOGIN_REQUEST_SUCCESS,
			} );

			expect( state ).toBeNull();

			state = requestError( 'some error', {
				type: SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS,
			} );

			expect( state ).toBeNull();
		} );

		test( 'should store the error in requestError if a request is unsuccessful', () => {
			let state = requestError( 'some error', {
				type: LOGIN_REQUEST_FAILURE,
				error: 'another error',
			} );

			expect( state ).toEqual( 'another error' );

			state = requestError( 'some error', {
				type: SOCIAL_CONNECT_ACCOUNT_REQUEST_FAILURE,
				error: 'yet another error',
			} );

			expect( state ).toEqual( 'yet another error' );
		} );

		test( 'should reset the error to null when switching routes', () => {
			const state = requestError( 'some error', {
				type: ROUTE_SET,
			} );

			expect( state ).toBeNull();
		} );
	} );

	describe( 'twoFactorAuthRequestError', () => {
		test( 'should default to a null', () => {
			const state = twoFactorAuthRequestError( undefined, {} );

			expect( state ).toBeNull();
		} );

		test( 'should set requestError to null value if a request is initiated', () => {
			const state = twoFactorAuthRequestError( 'some error', {
				type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST,
			} );

			expect( state ).toBeNull();
		} );

		test( 'should set requestError to null value if a request was successful', () => {
			const state = twoFactorAuthRequestError( 'some error', {
				type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS,
			} );

			expect( state ).toBeNull();
		} );

		test( 'should store the error in requestError if a request is unsuccessful', () => {
			const state = twoFactorAuthRequestError( 'some error', {
				type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
				error: 'another error',
			} );

			expect( state ).toEqual( 'another error' );
		} );

		test( 'should reset the error to null when switching routes', () => {
			const state = twoFactorAuthRequestError( 'some error', {
				type: ROUTE_SET,
			} );

			expect( state ).toBeNull();
		} );
	} );

	describe( 'requestNotice', () => {
		test( 'should default to a null', () => {
			const state = requestNotice( undefined, {} );

			expect( state ).toBeNull();
		} );

		test( 'should set `notice` object if a request was initiated', () => {
			const state = requestNotice( null, {
				type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST,
				notice: {
					message: 'foo',
				},
			} );

			expect( state ).toEqual( {
				message: 'foo',
			} );
		} );

		test( 'should set `notice` object if a request was successful', () => {
			const state = requestNotice( null, {
				type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS,
				notice: {
					message: 'foo',
				},
			} );

			expect( state ).toEqual( {
				message: 'foo',
			} );
		} );

		test( 'should set requestNotice to null value if a request is unsuccessful', () => {
			const state = requestNotice( null, {
				type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE,
			} );

			expect( state ).toBeNull();
		} );
	} );

	describe( 'requestSuccess', () => {
		test( 'should default to a null', () => {
			const state = requestSuccess( undefined, {} );

			expect( state ).toBeNull();
		} );

		test( 'should set requestSuccess to null value if a request is initiated', () => {
			const state = requestSuccess( undefined, {
				type: LOGIN_REQUEST,
			} );

			expect( state ).toBeNull();
		} );

		test( 'should set requestSuccess to true value if a request was successful', () => {
			const state = requestSuccess( null, {
				type: LOGIN_REQUEST_SUCCESS,
			} );

			expect( state ).toBe( true );
		} );

		test( 'should set requestSuccess to false value if a request is unsuccessful', () => {
			const state = requestSuccess( null, {
				type: LOGIN_REQUEST_FAILURE,
			} );

			expect( state ).toBe( false );
		} );
	} );

	describe( 'twoFactorAuth', () => {
		test( 'should default to a null', () => {
			const state = twoFactorAuth( undefined, {} );

			expect( state ).toBeNull();
		} );

		test( 'should set twoFactorAuth to null value if a request is initiated', () => {
			const state = twoFactorAuth( undefined, {
				type: LOGIN_REQUEST,
			} );

			expect( state ).toBeNull();
		} );

		test( 'should set twoFactorAuth to null value if a social request is initiated', () => {
			const state = twoFactorAuth( undefined, {
				type: SOCIAL_LOGIN_REQUEST,
			} );

			expect( state ).toBeNull();
		} );

		test( 'should set twoFactorAuth to the response value if a request was successful', () => {
			const data = {
				result: true,
				two_step_id: 12345678,
				two_step_nonce: 'abcdefgh1234',
			};
			const state = twoFactorAuth( null, {
				type: LOGIN_REQUEST_SUCCESS,
				data,
			} );

			expect( state ).toEqual( {
				two_step_id: 12345678,
				two_step_nonce: 'abcdefgh1234',
			} );
		} );

		test( 'should set twoFactorAuth to null value if a request is unsuccessful', () => {
			const state = twoFactorAuth( null, {
				type: LOGIN_REQUEST_FAILURE,
			} );

			expect( state ).toBeNull();
		} );

		test( 'should set twoFactorAuth to the response value if a social request was successful', () => {
			const data = {
				result: true,
				two_step_id: 12345678,
				two_step_nonce: 'abcdefgh1234',
			};
			const state = twoFactorAuth( null, {
				type: SOCIAL_LOGIN_REQUEST_SUCCESS,
				data,
			} );

			expect( state ).toEqual( {
				two_step_id: 12345678,
				two_step_nonce: 'abcdefgh1234',
			} );
		} );

		test( 'should set twoFactorAuth to null value if a social request is unsuccessful', () => {
			const state = twoFactorAuth( null, {
				type: SOCIAL_LOGIN_REQUEST_FAILURE,
			} );

			expect( state ).toBeNull();
		} );

		test( 'should update the "two_step_nonce" value when requested', () => {
			const data = {
				two_step_id: 12345678,
				two_step_nonce_authenticator: 'abcdefgh1234',
			};

			const state = twoFactorAuth( data, {
				type: TWO_FACTOR_AUTHENTICATION_UPDATE_NONCE,
				twoStepNonce: 'foo',
				nonceType: 'authenticator',
			} );

			expect( state ).toEqual( {
				two_step_id: 12345678,
				two_step_nonce_authenticator: 'foo',
			} );
		} );

		test( 'should reset the "notice" value when an SMS code request is made', () => {
			const state = requestSuccess( null, {
				type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST,
			} );

			expect( state ).toBeNull();
		} );

		test( 'should reset the "two_step_nonce" value when a two factor authentication SMS code request returns new nonce', () => {
			const data = {
				two_step_id: 12345678,
				two_step_nonce_sms: 'abcdefgh1234',
			};

			const state = twoFactorAuth( data, {
				type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS,
				twoStepNonce: 'foo',
			} );

			expect( state ).toEqual( {
				two_step_id: 12345678,
				two_step_nonce_sms: 'foo',
			} );
		} );

		test( 'should reset the "two_step_nonce" value when a failed two factor authentication SMS code request returns new nonce', () => {
			const data = {
				two_step_id: 12345678,
				two_step_nonce_sms: 'abcdefgh1234',
			};

			const state = twoFactorAuth( data, {
				type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE,
				twoStepNonce: 'foo',
			} );

			expect( state ).toEqual( {
				two_step_id: 12345678,
				two_step_nonce_sms: 'foo',
			} );
		} );
	} );

	describe( 'socialAccount', () => {
		test( 'should store error from create account failure', () => {
			const error = { message: 'Bad', code: 'this_is_a_test' };
			const service = 'google';
			const token = '123';

			const state = socialAccount(
				{},
				{
					type: SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE,
					error,
					service,
					token,
				}
			);

			expect( state.createError ).toEqual( error );
		} );

		test( 'default value for create error should be null', () => {
			expect( socialAccount( undefined, { type: 'does not matter' } ).createError ).toBeNull();
		} );

		test( 'should reset create error when user is received', () => {
			const state = { createError: {} };

			const newState = socialAccount( state, {
				type: CURRENT_USER_RECEIVE,
			} );

			expect( newState.createError ).toBeNull();
		} );

		test( 'should reset create error when login is performed', () => {
			const state = { createError: {} };

			const newState = socialAccount( state, { type: LOGIN_REQUEST } );

			expect( newState.createError ).toBeNull();
		} );
	} );

	describe( 'socialAccountLink', () => {
		test( 'should set linking mode on user_exists create error', () => {
			const error = { message: 'Bad', code: 'user_exists', email: 'hello@test.com' };
			const authInfo = { id_token: '123', access_token: '123', service: 'google' };

			const state = socialAccountLink(
				{},
				{
					type: SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE,
					error,
					authInfo,
				}
			);

			expect( state ).toEqual( {
				isLinking: true,
				authInfo,
				email: error.email,
			} );
		} );

		test( 'should reset linking mode when user is received', () => {
			const state = { createError: {} };

			const newState = socialAccountLink( state, {
				type: CURRENT_USER_RECEIVE,
			} );

			expect( newState ).toEqual( { isLinking: false } );
		} );
	} );
} );
