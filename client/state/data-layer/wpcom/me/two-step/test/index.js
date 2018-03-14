/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	requestTwoStep,
	storeFetchedTwoStep,
	fromApi,
	validateTwoStepCode,
	storeTwoStepCodeValidationResult,
	sendSMSValidationCode,
	storeSendSMSValidationCodeResult,
	storeSendSMSValidationCodeError,
} from '../';
import {
	TWO_STEP_SET,
	TWO_STEP_VALIDATE_CODE_REQUEST,
	TWO_STEP_SET_CODE_VALIDATION_RESULT,
	USER_PROFILE_LINKS_REQUEST,
	TWO_STEP_SEND_SMS_CODE_REQUEST,
	TWO_STEP_SET_CODE_SEND_SMS_CODE_RESULT,
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';

import userSettings from 'lib/user-settings';
import applicationPasswords from 'lib/application-passwords-data';
import connectedApplications from 'lib/connected-applications-data';

jest.mock( 'lib/user', () => () => {} );
jest.mock( 'store/store', () => () => {} );
jest.mock( 'lib/user-settings', () => ( {
	fetchSettings: () => {},
} ) );
jest.mock( 'lib/application-passwords-data', () => ( {
	fetch: () => {},
} ) );
jest.mock( 'lib/connected-applications-data', () => ( {
	fetch: () => {},
} ) );

describe( 'wpcom-api', () => {
	describe( 'two-step', () => {
		describe( '#requestTwoStep', () => {
			test( 'should dispatch HTTP request to the two-step endpoint', () => {
				const dispatch = spy();

				requestTwoStep( { dispatch } );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					http( {
						apiVersion: '1.1',
						method: 'GET',
						path: '/me/two-step/',
					} )
				);
			} );
		} );

		describe( '#fromApi', () => {
			test( 'should convert snake_case to camelCase', () => {
				expect(
					fromApi( {
						hello_world: 'hello',
					} )
				).to.eql( {
					helloWorld: 'hello',
				} );
			} );
		} );

		describe( '#storeFetchedTwoStep', () => {
			test( 'should dispatch two step information set', () => {
				const data = {
					two_step_backup_codes_printed: false,
					two_step_enabled: true,
					two_step_sms_enabled: false,
					two_step_reauthorization_required: false,
					two_step_authorization_expires_soon: false,
					two_step_sms_last_four: '1234',
				};
				const dispatch = spy();

				storeFetchedTwoStep( { dispatch }, null, data );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( {
					type: TWO_STEP_SET,
					data: {
						twoStepAuthorizationExpiresSoon: false,
						twoStepBackupCodesPrinted: false,
						twoStepEnabled: true,
						twoStepReauthorizationRequired: false,
						twoStepSmsEnabled: false,
						twoStepSmsLastFour: '1234',
					},
				} );
			} );
		} );

		describe( '#validateTwoStepCode', () => {
			test( 'should dispatch http request to validate two step endpoint', () => {
				const dispatch = spy();

				const action = {
					type: TWO_STEP_VALIDATE_CODE_REQUEST,
					code: '12345',
					action: 'hello',
					remember2fa: true,
				};
				validateTwoStepCode( { dispatch }, action );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					http(
						{
							apiVersion: '1.1',
							method: 'POST',
							path: '/me/two-step/validate',
							body: {
								code: '12345',
								action: 'hello',
								remember2fa: true,
							},
						},
						action
					)
				);
			} );

			test( 'should dispatch http request to validate two step endpoint only with supplied params', () => {
				const dispatch = spy();

				const action = {
					type: TWO_STEP_VALIDATE_CODE_REQUEST,
					code: '12345',
				};
				validateTwoStepCode( { dispatch }, action );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					http(
						{
							apiVersion: '1.1',
							method: 'POST',
							path: '/me/two-step/validate',
							body: {
								code: '12345',
							},
						},
						action
					)
				);
			} );
		} );
	} );

	describe( '#storeTwoStepCodeValidationResult', () => {
		test( 'should dispatch USER_PROFILE_LINKS_REQUEST and call flux legacy stores if reauth was required', () => {
			const data = {
				success: true,
			};
			const dispatch = spy();
			userSettings.fetchSettings = spy();
			applicationPasswords.fetch = spy();
			connectedApplications.fetch = spy();

			storeTwoStepCodeValidationResult(
				{
					dispatch,
					getState: () => ( {
						twoStep: {
							settings: {
								twoStepReauthorizationRequired: true,
							},
						},
					} ),
				},
				null,
				data
			);

			expect( dispatch ).to.have.been.calledTwice;
			expect( dispatch ).to.have.been.calledWith( {
				type: USER_PROFILE_LINKS_REQUEST,
			} );
			expect( userSettings.fetchSettings ).to.have.been.calledOnce;
			expect( applicationPasswords.fetch ).to.have.been.calledOnce;
			expect( connectedApplications.fetch ).to.have.been.calledOnce;
		} );

		test( 'should dispatch action to store two step code validation result', () => {
			const data = {
				success: true,
			};
			const dispatch = spy();

			storeTwoStepCodeValidationResult( { dispatch, getState: () => ( {} ) }, null, data );

			expect( dispatch ).to.have.been.calledOnce;

			expect( dispatch ).to.have.been.calledWith( {
				type: TWO_STEP_SET_CODE_VALIDATION_RESULT,
				data: {
					success: true,
				},
			} );
		} );
	} );

	describe( '#sendSMSValidationCode', () => {
		test( 'it should dispatch http action to call send sms code endpoint', () => {
			const dispatch = spy();

			const action = {
				type: TWO_STEP_SEND_SMS_CODE_REQUEST,
			};
			sendSMSValidationCode( { dispatch }, action );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				http(
					{
						apiVersion: '1.1',
						method: 'POST',
						path: '/me/two-step/sms/new',
					},
					action
				)
			);
		} );
	} );

	describe( '#storeSendSMSValidationCodeResult', () => {
		test( 'should dispatch store send sms code result', () => {
			const data = {
				success: true,
			};
			const dispatch = spy();

			storeSendSMSValidationCodeResult( { dispatch }, null, data );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith( {
				type: TWO_STEP_SET_CODE_SEND_SMS_CODE_RESULT,
				data: {
					success: true,
				},
			} );
		} );
	} );

	describe( '#storeSendSMSValidationCodeError', () => {
		test( 'should dispatch store send sms code result', () => {
			const data = {
				error: 'rate_limited',
			};
			const dispatch = spy();

			storeSendSMSValidationCodeError( { dispatch }, null, data );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith( {
				type: TWO_STEP_SET_CODE_SEND_SMS_CODE_RESULT,
				data: {
					error: 'rate_limited',
				},
			} );
		} );
	} );
} );
