/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isCodeValidationFailed, isSMSResendThrottled } from '../selectors';

describe( 'two-step selecotrs', () => {
	describe( '#isCodeValidationFailed', () => {
		test( 'should be false if no request was made', () => {
			expect(
				isCodeValidationFailed( {
					twoStep: {
						codeValidationResult: null,
					},
				} )
			).to.be.false;
		} );

		test( 'should be false if result was true', () => {
			expect(
				isCodeValidationFailed( {
					twoStep: {
						codeValidationResult: true,
					},
				} )
			).to.be.false;
		} );

		test( 'should be true if result was false', () => {
			expect(
				isCodeValidationFailed( {
					twoStep: {
						codeValidationResult: false,
					},
				} )
			).to.be.true;
		} );
	} );

	describe( '#isSMSResendThrottled', () => {
		test( 'should be true when error is rate_limited', () => {
			expect(
				isSMSResendThrottled( {
					twoStep: {
						SMSValidationCodeResult: {
							error: 'rate_limited',
						},
					},
				} )
			).to.be.true;
		} );

		test( 'should be false when error is no rate_limited', () => {
			expect(
				isSMSResendThrottled( {
					twoStep: {
						SMSValidationCodeResult: {
							error: 'bad_error',
						},
					},
				} )
			).to.be.false;
		} );
	} );
} );
