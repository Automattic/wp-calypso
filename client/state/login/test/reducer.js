/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	LOGIN_REQUEST,
	LOGIN_REQUEST_FAILURE,
	LOGIN_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS,
} from 'state/action-types';
import reducer, {
	isRequesting,
	isRequestingTwoFactorAuth,
	requestError,
	requestSuccess,
	twoFactorAuth,
	twoFactorAuthRequestError,
} from '../reducer';

describe( 'reducer', () => {
	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'isRequesting',
			'magicLogin',
			'requestError',
			'requestSuccess',
			'twoFactorAuth',
			'isRequestingTwoFactorAuth',
			'twoFactorAuthRequestError',
		] );
	} );

	const isRequestingReducers = [
		{
			name: 'isRequesting',
			func: isRequesting,
			loadingAction: LOGIN_REQUEST,
			failureAction: LOGIN_REQUEST_FAILURE,
			successAction: LOGIN_REQUEST_SUCCESS,
		},
		{
			name: 'isRequestingTwoFactorAuth',
			func: isRequestingTwoFactorAuth,
			loadingAction: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST,
			failureAction: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
			successAction: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS,
		},
	];

	isRequestingReducers.forEach( currentReducer => {
		describe( `${ currentReducer.name }`, () => {
			it( 'should default to a false', () => {
				const state = currentReducer.func( undefined, {} );

				expect( state ).to.be.false;
			} );

			it( `should set ${ currentReducer.name } to true value if a request is initiated`, () => {
				const state = currentReducer.func( undefined, {
					type: currentReducer.loadingAction,
				} );

				expect( state ).to.be.true;
			} );

			it( `should set ${ currentReducer.name } to false value if a request was unsuccessful`, () => {
				const state = currentReducer.func( undefined, {
					type: currentReducer.failureAction,
				} );

				expect( state ).to.be.false;
			} );

			it( `should set ${ currentReducer.name } to false value if a request was successful`, () => {
				const state = currentReducer.func( undefined, {
					type: currentReducer.successAction,
				} );

				expect( state ).to.be.false;
			} );

			it( 'should not persist state', () => {
				const state = currentReducer.func( true, {
					type: SERIALIZE
				} );

				expect( state ).to.be.false;
			} );

			it( 'should not load persisted state', () => {
				const state = currentReducer.func( true, {
					type: DESERIALIZE
				} );

				expect( state ).to.be.false;
			} );
		} );
	} );

	const requestErrorReducers = [
		{
			name: 'requestError',
			func: requestError,
			loadingAction: LOGIN_REQUEST,
			failureAction: LOGIN_REQUEST_FAILURE,
			successAction: LOGIN_REQUEST_SUCCESS,
		},
		{
			name: 'twoFactorAuthRequestError',
			func: twoFactorAuthRequestError,
			loadingAction: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST,
			failureAction: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
			successAction: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS,
		},
	];

	requestErrorReducers.forEach( currentReducer => {
		describe( `${ currentReducer.name }`, () => {
			it( 'should default to a null', () => {
				const state = currentReducer.func( undefined, {} );

				expect( state ).to.be.null;
			} );

			it( `should set ${ currentReducer.name } to null value if a request is initiated`, () => {
				const state = currentReducer.func( 'some error', {
					type: currentReducer.loadingAction,
				} );

				expect( state ).to.be.null;
			} );

			it( `should set ${ currentReducer.name } to null value if a request was successful`, () => {
				const state = currentReducer.func( 'some error', {
					type: currentReducer.successAction,
				} );

				expect( state ).to.be.null;
			} );

			it( `should store the error in ${ currentReducer.name } if a request is unsuccessful`, () => {
				const state = currentReducer.func( 'some error', {
					type: currentReducer.failureAction,
					error: 'another error'
				} );

				expect( state ).to.eql( 'another error' );
			} );

			it( 'should not persist state', () => {
				const state = currentReducer.func( 'some error', {
					type: SERIALIZE
				} );

				expect( state ).to.be.null;
			} );

			it( 'should not load persisted state', () => {
				const state = currentReducer.func( 'some error', {
					type: DESERIALIZE
				} );

				expect( state ).to.be.null;
			} );
		} );
	} );

	describe( 'requestSuccess', () => {
		it( 'should default to a null', () => {
			const state = requestSuccess( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should set requestSuccess to null value if a request is initiated', () => {
			const state = requestSuccess( undefined, {
				type: LOGIN_REQUEST,
			} );

			expect( state ).to.be.null;
		} );

		it( 'should set requestSuccess to true value if a request was successful', () => {
			const state = requestSuccess( null, {
				type: LOGIN_REQUEST_SUCCESS,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should set requestSuccess to false value if a request is unsuccessful', () => {
			const state = requestSuccess( null, {
				type: LOGIN_REQUEST_FAILURE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should not persist state', () => {
			const state = requestSuccess( true, {
				type: SERIALIZE
			} );

			expect( state ).to.be.null;
		} );

		it( 'should not load persisted state', () => {
			const state = requestSuccess( true, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.null;
		} );
	} );

	describe( 'twoFactorAuth', () => {
		it( 'should default to a null', () => {
			const state = twoFactorAuth( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should set twoFactorAuth to null value if a request is initiated', () => {
			const state = twoFactorAuth( undefined, {
				type: LOGIN_REQUEST,
			} );

			expect( state ).to.be.null;
		} );

		it( 'should set twoFactorAuth to the response value if a request was successful', () => {
			const data = {
				result: true,
				two_step_id: 12345678,
				two_step_nonce: 'abcdefgh1234',
			};
			const state = twoFactorAuth( null, {
				type: LOGIN_REQUEST_SUCCESS,
				data
			} );

			expect( state ).to.eql( data );
		} );

		it( 'should set twoFactorAuth to null value if a request is unsuccessful', () => {
			const state = twoFactorAuth( null, {
				type: LOGIN_REQUEST_FAILURE,
			} );

			expect( state ).to.be.null;
		} );

		it( 'should reset the `two_step_nonce` value when a two factor authentication request fails and returns a new nonce', () => {
			const data = {
				two_step_id: 12345678,
				two_step_nonce: 'abcdefgh1234',
			};

			const state = twoFactorAuth( data, {
				type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
				twoStepNonce: 'foo'
			} );

			expect( state ).to.eql( {
				two_step_id: 12345678,
				two_step_nonce: 'foo'
			} );
		} );

		it( 'should not persist state', () => {
			const state = twoFactorAuth( true, {
				type: SERIALIZE
			} );

			expect( state ).to.be.null;
		} );

		it( 'should not load persisted state', () => {
			const state = twoFactorAuth( true, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.null;
		} );
	} );
} );
