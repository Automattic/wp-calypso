/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST,
	LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST_SUCCESS,
	LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST_FAILURE,
	LOGIN_REQUEST,
	LOGIN_REQUEST_FAILURE,
	LOGIN_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, {
	isRequesting,
	isSubmittingVerificationCode,
	requestError,
	verificationCodeSubmissionError,
	requestSuccess,
	twoFactorAuth
} from '../reducer';

describe( 'reducer', () => {
	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'isRequesting',
			'isSubmittingVerificationCode',
			'requestError',
			'verificationCodeSubmissionError',
			'requestSuccess',
			'verificationCodeSubmissionSuccess',
			'twoFactorAuth',
		] );
	} );

	describe( 'isRequesting', () => {
		it( 'should default to a false', () => {
			const state = isRequesting( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should set isRequesting to true value if a request is initiated', () => {
			const state = isRequesting( undefined, {
				type: LOGIN_REQUEST,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should set isRequesting to false value if a request was unsuccessful', () => {
			const state = isRequesting( undefined, {
				type: LOGIN_REQUEST_FAILURE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should set isRequesting to false value if a request was successful', () => {
			const state = isRequesting( undefined, {
				type: LOGIN_REQUEST_SUCCESS,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should not persist state', () => {
			const state = isRequesting( true, {
				type: SERIALIZE
			} );

			expect( state ).to.be.false;
		} );

		it( 'should not load persisted state', () => {
			const state = isRequesting( true, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.false;
		} );
	} );

	describe( 'isSubmittingVerificationCode', () => {
		it( 'should default to a false', () => {
			const state = isSubmittingVerificationCode( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should set isSubmittingVerificationCode to true value if a request is initiated', () => {
			const state = isSubmittingVerificationCode( undefined, {
				type: LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should set isSubmittingVerificationCode to false value if a request was unsuccessful', () => {
			const state = isSubmittingVerificationCode( undefined, {
				type: LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST_FAILURE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should set isSubmittingVerificationCode to false value if a request was successful', () => {
			const state = isSubmittingVerificationCode( undefined, {
				type: LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST_SUCCESS,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should not persist state', () => {
			const state = isSubmittingVerificationCode( true, {
				type: SERIALIZE
			} );

			expect( state ).to.be.false;
		} );

		it( 'should not load persisted state', () => {
			const state = isSubmittingVerificationCode( true, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.false;
		} );
	} );

	describe( 'requestError', () => {
		it( 'should default to a null', () => {
			const state = requestError( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should set requestError to null value if a request is initiated', () => {
			const state = requestError( 'some error', {
				type: LOGIN_REQUEST,
			} );

			expect( state ).to.be.null;
		} );

		it( 'should set requestError to null value if a request was successful', () => {
			const state = requestError( 'some error', {
				type: LOGIN_REQUEST_SUCCESS,
			} );

			expect( state ).to.be.null;
		} );

		it( 'should store the error in requestError if a request is unsuccessful', () => {
			const state = requestError( 'some error', {
				type: LOGIN_REQUEST_FAILURE,
				error: 'another error'
			} );

			expect( state ).to.eql( 'another error' );
		} );

		it( 'should not persist state', () => {
			const state = requestError( 'some error', {
				type: SERIALIZE
			} );

			expect( state ).to.be.null;
		} );

		it( 'should not load persisted state', () => {
			const state = requestError( 'some error', {
				type: DESERIALIZE
			} );

			expect( state ).to.be.null;
		} );
	} );

	describe( 'verificationCodeSubmissionError', () => {
		it( 'should default to a null', () => {
			const state = verificationCodeSubmissionError( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should set verificationCodeSubmissionError to null value if a request is initiated', () => {
			const state = verificationCodeSubmissionError( 'some error', {
				type: LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST,
			} );

			expect( state ).to.be.null;
		} );

		it( 'should set verificationCodeSubmissionError to null value if a request was successful', () => {
			const state = verificationCodeSubmissionError( 'some error', {
				type: LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST_SUCCESS,
			} );

			expect( state ).to.be.null;
		} );

		it( 'should store the error in verificationCodeSubmissionError if a request is unsuccessful', () => {
			const state = verificationCodeSubmissionError( 'some error', {
				type: LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST_FAILURE,
				error: 'another error'
			} );

			expect( state ).to.eql( 'another error' );
		} );

		it( 'should not persist state', () => {
			const state = verificationCodeSubmissionError( 'some error', {
				type: SERIALIZE
			} );

			expect( state ).to.be.null;
		} );

		it( 'should not load persisted state', () => {
			const state = verificationCodeSubmissionError( 'some error', {
				type: DESERIALIZE
			} );

			expect( state ).to.be.null;
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
				twostep_id: 12345678,
				twostep_nonce: 'abcdefgh1234',
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
