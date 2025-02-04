import {
	MAGIC_LOGIN_HIDE_REQUEST_FORM,
	MAGIC_LOGIN_HIDE_REQUEST_NOTICE,
	MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
	MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE,
	MAGIC_LOGIN_SHOW_LINK_EXPIRED,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
	MAGIC_LOGIN_REQUEST_AUTH_ERROR,
	MAGIC_LOGIN_REQUEST_AUTH_FETCH,
	MAGIC_LOGIN_REQUEST_AUTH_SUCCESS,
	MAGIC_LOGIN_RESET_REQUEST_FORM,
} from 'calypso/state/action-types';
import {
	CHECK_YOUR_EMAIL_PAGE,
	INTERSTITIAL_PAGE,
	LINK_EXPIRED_PAGE,
	REQUEST_FORM,
} from '../constants';
import reducer, {
	isFetchingAuth,
	isFetchingEmail,
	currentView,
	requestAuthError,
	requestAuthSuccess,
	requestEmailError,
	requestEmailSuccess,
} from '../reducer';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [
				'currentView',
				'isFetchingAuth',
				'isFetchingEmail',
				'requestAuthError',
				'requestAuthSuccess',
				'requestEmailError',
				'requestEmailSuccess',
			] )
		);
	} );

	describe( 'isFetchingAuth', () => {
		test( 'should default to false', () => {
			const state = isFetchingAuth( undefined, {} );
			expect( state ).toBe( false );
		} );

		test( 'should be true on fetch', () => {
			const state = isFetchingAuth( undefined, {
				type: MAGIC_LOGIN_REQUEST_AUTH_FETCH,
			} );
			expect( state ).toBe( true );
		} );

		test( 'should be false on error', () => {
			const state = isFetchingAuth( undefined, {
				type: MAGIC_LOGIN_REQUEST_AUTH_ERROR,
			} );
			expect( state ).toBe( false );
		} );

		test( 'should be false on success', () => {
			const state = isFetchingAuth( undefined, {
				type: MAGIC_LOGIN_REQUEST_AUTH_SUCCESS,
			} );
			expect( state ).toBe( false );
		} );
	} );

	describe( 'isFetchingEmail', () => {
		test( 'should default to false', () => {
			const state = isFetchingEmail( undefined, {} );
			expect( state ).toBe( false );
		} );

		test( 'should be true on fetch', () => {
			const state = isFetchingEmail( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
			} );
			expect( state ).toBe( true );
		} );

		test( 'should be false on error', () => {
			const state = isFetchingEmail( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
			} );
			expect( state ).toBe( false );
		} );

		test( 'should be false on success', () => {
			const state = isFetchingEmail( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
			} );
			expect( state ).toBe( false );
		} );
	} );

	describe( 'requestAuthSuccess', () => {
		test( 'should default to false', () => {
			const state = requestAuthSuccess( undefined, {} );
			expect( state ).toBe( false );
		} );

		test( 'should be false on fetch', () => {
			const state = requestAuthSuccess( undefined, {
				type: MAGIC_LOGIN_REQUEST_AUTH_FETCH,
			} );
			expect( state ).toBe( false );
		} );

		test( 'should be false on error', () => {
			const state = requestAuthSuccess( undefined, {
				type: MAGIC_LOGIN_REQUEST_AUTH_ERROR,
				error: { code: 403, type: 'foo_bar' },
			} );
			expect( state ).toBe( false );
		} );

		test( 'should be true on success', () => {
			const state = requestAuthSuccess( undefined, {
				type: MAGIC_LOGIN_REQUEST_AUTH_SUCCESS,
			} );
			expect( state ).toBe( true );
		} );
	} );

	describe( 'requestAuthError', () => {
		test( 'should default to null', () => {
			const state = requestAuthError( undefined, {} );
			expect( state ).toBeNull();
		} );

		test( 'should be null on fetch', () => {
			const state = requestAuthError( undefined, {
				type: MAGIC_LOGIN_REQUEST_AUTH_FETCH,
			} );
			expect( state ).toBeNull();
		} );

		test( 'should be error on error', () => {
			const error = { code: 403, type: 'foo_bar' };
			const state = requestAuthError( undefined, {
				type: MAGIC_LOGIN_REQUEST_AUTH_ERROR,
				error,
			} );
			expect( state ).toEqual( error );
		} );

		test( 'should be null on success', () => {
			const state = requestAuthError( undefined, {
				type: MAGIC_LOGIN_REQUEST_AUTH_SUCCESS,
			} );
			expect( state ).toBeNull();
		} );
	} );

	describe( 'requestEmailError', () => {
		test( 'should default to null', () => {
			const state = requestEmailError( undefined, {} );
			expect( state ).toBeNull();
		} );

		test( 'should be null on fetch', () => {
			const state = requestEmailError( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
			} );
			expect( state ).toBeNull();
		} );

		test( 'should be error on error', () => {
			const state = requestEmailError( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
				error: 'foo bar',
			} );
			expect( state ).toEqual( 'foo bar' );
		} );

		test( 'should be null on success', () => {
			const state = requestEmailError( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
			} );
			expect( state ).toBeNull();
		} );

		test( 'should be null on hide request notice', () => {
			const state = requestEmailError( undefined, {
				type: MAGIC_LOGIN_HIDE_REQUEST_NOTICE,
			} );
			expect( state ).toBeNull();
		} );
	} );

	describe( 'requestEmailSuccess', () => {
		test( 'should default to false', () => {
			const state = requestEmailSuccess( undefined, {} );
			expect( state ).toBe( false );
		} );

		test( 'should be false on fetch action', () => {
			const state = requestEmailSuccess( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
			} );
			expect( state ).toBe( false );
		} );

		test( 'should be false on error', () => {
			const state = requestEmailSuccess( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
			} );
			expect( state ).toBe( false );
		} );

		test( 'should be true on success', () => {
			const state = requestEmailSuccess( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
			} );
			expect( state ).toBe( true );
		} );
	} );

	describe( 'currentView', () => {
		test( 'should default to null', () => {
			const state = currentView( undefined, {} );
			expect( state ).toBeNull();
		} );

		test( 'should be check email page on show check email', () => {
			const state = currentView( undefined, {
				type: MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
			} );
			expect( state ).toEqual( CHECK_YOUR_EMAIL_PAGE );
		} );

		test( 'should be interstitial page on show interstitial', () => {
			const state = currentView( undefined, {
				type: MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE,
			} );
			expect( state ).toEqual( INTERSTITIAL_PAGE );
		} );

		test( 'should be null on hide request form', () => {
			const state = currentView( undefined, {
				type: MAGIC_LOGIN_HIDE_REQUEST_FORM,
			} );
			expect( state ).toBeNull();
		} );

		test( 'should be expired page on show expired', () => {
			const state = currentView( undefined, {
				type: MAGIC_LOGIN_SHOW_LINK_EXPIRED,
			} );
			expect( state ).toEqual( LINK_EXPIRED_PAGE );
		} );

		test( 'should be request form on reset request form', () => {
			const state = currentView( undefined, {
				type: MAGIC_LOGIN_RESET_REQUEST_FORM,
			} );
			expect( state ).toEqual( REQUEST_FORM );
		} );
	} );
} );
