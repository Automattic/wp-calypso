/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	TWO_STEP_SET,
	TWO_STEP_VALIDATE_CODE_REQUEST,
	TWO_STEP_SET_CODE_VALIDATION_RESULT,
	TWO_STEP_SEND_SMS_CODE_REQUEST,
	TWO_STEP_SET_CODE_SEND_SMS_CODE_RESULT,
} from 'state/action-types';

import {
	settings,
	SMSValidationCodeResult,
	isCodeValidationInProgress,
	codeValidationResult,
} from '../reducer';

describe( 'two-step state reducer', () => {
	describe( '#settings', () => {
		test( 'should set settings state on set action', () => {
			const data = {
				twoStepAuthorizationExpiresSoon: false,
				twoStepBackupCodesPrinted: false,
				twoStepEnabled: true,
				twoStepReauthorizationRequired: false,
				twoStepSmsEnabled: false,
				twoStepSmsLastFour: '1234',
			};

			const result = settings( undefined, {
				type: TWO_STEP_SET,
				data,
			} );

			expect( result ).to.eql( data );
		} );

		test( 'should reset reauthorization required and expires soon flags on succesfull code validation', () => {
			const state = {
				twoStepAuthorizationExpiresSoon: true,
				twoStepReauthorizationRequired: true,
			};

			const result = settings( state, {
				type: TWO_STEP_SET_CODE_VALIDATION_RESULT,
				data: {
					success: true,
				},
			} );

			expect( result ).to.eql( {
				twoStepAuthorizationExpiresSoon: false,
				twoStepReauthorizationRequired: false,
			} );
		} );
	} );

	describe( '#SMSValidationCodeResult', () => {
		test( 'should reset result on request', () => {
			const result = SMSValidationCodeResult(
				{ hello: 'world' },
				{
					type: TWO_STEP_SEND_SMS_CODE_REQUEST,
				}
			);

			expect( result ).to.be.null;
		} );

		test( 'should set reslut', () => {
			const result = SMSValidationCodeResult( undefined, {
				type: TWO_STEP_SET_CODE_SEND_SMS_CODE_RESULT,
				data: {
					success: true,
				},
			} );

			expect( result ).to.eql( { success: true } );
		} );
	} );

	describe( '#isCodeValidationInProgress', () => {
		test( 'should be set in progress upon request', () => {
			expect(
				isCodeValidationInProgress( undefined, {
					type: TWO_STEP_VALIDATE_CODE_REQUEST,
				} )
			).to.be.true;
		} );

		test( 'should be false when request finish', () => {
			expect(
				isCodeValidationInProgress( undefined, {
					type: TWO_STEP_SET_CODE_VALIDATION_RESULT,
				} )
			).to.be.false;
		} );
	} );

	describe( '#codeValidationResult', () => {
		test( 'should reset upon request', () => {
			expect(
				codeValidationResult( undefined, {
					type: TWO_STEP_VALIDATE_CODE_REQUEST,
				} )
			).to.be.null;
		} );

		test( 'should be set to result when request finish', () => {
			expect(
				codeValidationResult( undefined, {
					type: TWO_STEP_SET_CODE_VALIDATION_RESULT,
					data: {
						success: true,
					},
				} )
			).to.be.true;
		} );
	} );
} );
