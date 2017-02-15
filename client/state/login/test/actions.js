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
	LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST,
	LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST_FAILURE,
	LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST_SUCCESS,
} from 'state/action-types';
import { loginUser } from '../actions';
import { loginUserWithTwoFactorVerificationCode } from '../actions';
import { useSandbox } from 'test/helpers/use-sinon';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	const username_or_email = 'wordpress';
	const password = '12345678';
	const successResponse = {
		code: 'success'
	};

	describe( '#loginUser()', () => {
		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/login/', {
						username_or_email,
						password
					} )
					.reply( 200, successResponse, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should return a login request action object when called', () => {
				loginUser( username_or_email, password )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: LOGIN_REQUEST,
					username_or_email,
					password,
				} );
			} );

			it( 'should return a login success action when request successfully completes', () => {
				return loginUser( username_or_email, password )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: LOGIN_REQUEST_SUCCESS,
						username_or_email,
						password,
						data: successResponse
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/login/', {
						username_or_email,
						password
					} )
					.reply( 401, {
						message: 'Invalid credentials'
					}, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should return a login failure action when an error occurs', () => {
				return loginUser( username_or_email, password )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: LOGIN_REQUEST_FAILURE,
						username_or_email,
						password,
						error: 'Invalid credentials'
					} );
				} );
			} );
		} );
	} );

	describe( '#loginUserWithTwoFactorVerificationCode()', () => {
		const twostep_id = 12310123;
		const twostep_code = '123678';
		const twostep_nonce = 'AUSAD123123';
		const remember_me = true;

		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/login/two-step/', {
						twostep_id,
						twostep_code,
						twostep_nonce,
						remember: remember_me
					} )
					.reply( 200, successResponse, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should return a verification-code-based login request action object when called', () => {
				loginUserWithTwoFactorVerificationCode( twostep_id, twostep_code, twostep_nonce, remember_me )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST,
					twostep_id,
					twostep_code,
					twostep_nonce,
					remember: remember_me
				} );
			} );

			it( 'should return a verification-code-based login success action when request successfully completes', () => {
				return loginUserWithTwoFactorVerificationCode( twostep_id, twostep_code, twostep_nonce, remember_me )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST_SUCCESS,
						twostep_id,
						twostep_code,
						twostep_nonce,
						data: successResponse
					} );
				} );
			} );
		} );

		describe( 'failure', () => {

			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/login/two-step/', {
						twostep_id,
						twostep_code,
						twostep_nonce,
						remember: remember_me
					} )
					.reply( 401, {
						message: 'Invalid verification code'
					}, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should return a verification-code-based login failure action when an error occurs', () => {
				return loginUserWithTwoFactorVerificationCode( twostep_id, twostep_code, twostep_nonce, remember_me )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST_FAILURE,
						twostep_id,
						twostep_code,
						twostep_nonce,
						error: 'Invalid verification code'
					} );
				} );
			} );
		} );
	} );
} );
