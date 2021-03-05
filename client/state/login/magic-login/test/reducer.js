/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
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

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'currentView',
			'isFetchingAuth',
			'isFetchingEmail',
			'requestAuthError',
			'requestAuthSuccess',
			'requestEmailError',
			'requestEmailSuccess',
		] );
	} );

	describe( 'isFetchingAuth', () => {
		test( 'should default to false', () => {
			const state = isFetchingAuth( undefined, {} );
			expect( state ).to.be.false;
		} );

		test( 'should be true on fetch', () => {
			const state = isFetchingAuth( undefined, {
				type: MAGIC_LOGIN_REQUEST_AUTH_FETCH,
			} );
			expect( state ).to.be.true;
		} );

		test( 'should be false on error', () => {
			const state = isFetchingAuth( undefined, {
				type: MAGIC_LOGIN_REQUEST_AUTH_ERROR,
			} );
			expect( state ).to.be.false;
		} );

		test( 'should be false on success', () => {
			const state = isFetchingAuth( undefined, {
				type: MAGIC_LOGIN_REQUEST_AUTH_SUCCESS,
			} );
			expect( state ).to.be.false;
		} );
	} );

	describe( 'isFetchingEmail', () => {
		test( 'should default to false', () => {
			const state = isFetchingEmail( undefined, {} );
			expect( state ).to.be.false;
		} );

		test( 'should be true on fetch', () => {
			const state = isFetchingEmail( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
			} );
			expect( state ).to.be.true;
		} );

		test( 'should be false on error', () => {
			const state = isFetchingEmail( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
			} );
			expect( state ).to.be.false;
		} );

		test( 'should be false on success', () => {
			const state = isFetchingEmail( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
			} );
			expect( state ).to.be.false;
		} );
	} );

	describe( 'requestAuthSuccess', () => {
		test( 'should default to false', () => {
			const state = requestAuthSuccess( undefined, {} );
			expect( state ).to.be.false;
		} );

		test( 'should be false on fetch', () => {
			const state = requestAuthSuccess( undefined, {
				type: MAGIC_LOGIN_REQUEST_AUTH_FETCH,
			} );
			expect( state ).to.be.false;
		} );

		test( 'should be false on error', () => {
			const state = requestAuthSuccess( undefined, {
				type: MAGIC_LOGIN_REQUEST_AUTH_ERROR,
				error: 'foo bar',
			} );
			expect( state ).to.be.false;
		} );

		test( 'should be true on success', () => {
			const state = requestAuthSuccess( undefined, {
				type: MAGIC_LOGIN_REQUEST_AUTH_SUCCESS,
			} );
			expect( state ).to.be.true;
		} );
	} );

	describe( 'requestAuthError', () => {
		test( 'should default to null', () => {
			const state = requestAuthError( undefined, {} );
			expect( state ).to.be.null;
		} );

		test( 'should be null on fetch', () => {
			const state = requestAuthError( undefined, {
				type: MAGIC_LOGIN_REQUEST_AUTH_FETCH,
			} );
			expect( state ).to.be.null;
		} );

		test( 'should be error on error', () => {
			const state = requestAuthError( undefined, {
				type: MAGIC_LOGIN_REQUEST_AUTH_ERROR,
				error: 'foo bar',
			} );
			expect( state ).to.equal( 'foo bar' );
		} );

		test( 'should be null on success', () => {
			const state = requestAuthError( undefined, {
				type: MAGIC_LOGIN_REQUEST_AUTH_SUCCESS,
			} );
			expect( state ).to.be.null;
		} );
	} );

	describe( 'requestEmailError', () => {
		test( 'should default to null', () => {
			const state = requestEmailError( undefined, {} );
			expect( state ).to.be.null;
		} );

		test( 'should be null on fetch', () => {
			const state = requestEmailError( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
			} );
			expect( state ).to.be.null;
		} );

		test( 'should be error on error', () => {
			const state = requestEmailError( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
				error: 'foo bar',
			} );
			expect( state ).to.equal( 'foo bar' );
		} );

		test( 'should be null on success', () => {
			const state = requestEmailError( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
			} );
			expect( state ).to.be.null;
		} );

		test( 'should be null on hide request notice', () => {
			const state = requestEmailError( undefined, {
				type: MAGIC_LOGIN_HIDE_REQUEST_NOTICE,
			} );
			expect( state ).to.be.null;
		} );
	} );

	describe( 'requestEmailSuccess', () => {
		test( 'should default to false', () => {
			const state = requestEmailSuccess( undefined, {} );
			expect( state ).to.be.false;
		} );

		test( 'should be false on fetch action', () => {
			const state = requestEmailSuccess( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
			} );
			expect( state ).to.be.false;
		} );

		test( 'should be false on error', () => {
			const state = requestEmailSuccess( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
			} );
			expect( state ).to.be.false;
		} );

		test( 'should be true on success', () => {
			const state = requestEmailSuccess( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
			} );
			expect( state ).to.be.true;
		} );
	} );

	describe( 'currentView', () => {
		test( 'should default to null', () => {
			const state = currentView( undefined, {} );
			expect( state ).to.be.null;
		} );

		test( 'should be check email page on show check email', () => {
			const state = currentView( undefined, {
				type: MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
			} );
			expect( state ).to.equal( CHECK_YOUR_EMAIL_PAGE );
		} );

		test( 'should be interstitial page on show interstitial', () => {
			const state = currentView( undefined, {
				type: MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE,
			} );
			expect( state ).to.equal( INTERSTITIAL_PAGE );
		} );

		test( 'should be null on hide request form', () => {
			const state = currentView( undefined, {
				type: MAGIC_LOGIN_HIDE_REQUEST_FORM,
			} );
			expect( state ).to.be.null;
		} );

		test( 'should be expired page on show expired', () => {
			const state = currentView( undefined, {
				type: MAGIC_LOGIN_SHOW_LINK_EXPIRED,
			} );
			expect( state ).to.equal( LINK_EXPIRED_PAGE );
		} );

		test( 'should be request form on reset request form', () => {
			const state = currentView( undefined, {
				type: MAGIC_LOGIN_RESET_REQUEST_FORM,
			} );
			expect( state ).to.equal( REQUEST_FORM );
		} );
	} );
} );
