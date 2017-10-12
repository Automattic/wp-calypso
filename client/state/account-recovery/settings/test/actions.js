/** @format */

/**
 * External dependencies
 */
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	accountRecoverySettingsFetch,
	accountRecoverySettingsFetchSuccess,
	accountRecoverySettingsFetchFailed,
	updateAccountRecoveryPhone,
	updateAccountRecoveryPhoneSuccess,
	updateAccountRecoveryPhoneFailed,
	deleteAccountRecoveryPhone,
	deleteAccountRecoveryPhoneSuccess,
	deleteAccountRecoveryPhoneFailed,
	updateAccountRecoveryEmail,
	updateAccountRecoveryEmailSuccess,
	updateAccountRecoveryEmailFailed,
	deleteAccountRecoveryEmail,
	deleteAccountRecoveryEmailSuccess,
	deleteAccountRecoveryEmailFailed,
	resendAccountRecoveryEmailValidation,
	resendAccountRecoveryEmailValidationSuccess,
	resendAccountRecoveryEmailValidationFailed,
	resendAccountRecoveryPhoneValidation,
	resendAccountRecoveryPhoneValidationSuccess,
	resendAccountRecoveryPhoneValidationFailed,
	validateAccountRecoveryPhone,
	validateAccountRecoveryPhoneSuccess,
	validateAccountRecoveryPhoneFailed,
} from '../actions';
import { dummyData, dummyNewPhone, dummyNewEmail } from './test-data';
import { generateSuccessAndFailedTestsForThunk } from './utils';
import {
	ACCOUNT_RECOVERY_SETTINGS_FETCH,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_DELETE,
	ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION,
	ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE,
	ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_FAILED,
} from 'state/action-types';

import { useSandbox } from 'test/helpers/use-sinon';

describe( 'account-recovery actions', () => {
	let spy;
	useSandbox( sandbox => ( spy = sandbox.spy() ) );

	const errorResponse = { status: 400, message: 'Something wrong!' };

	generateSuccessAndFailedTestsForThunk( {
		testBaseName: '#accountRecoverySettingsFetch',
		nockSettings: {
			method: 'get',
			endpoint: '/rest/v1.1/me/account-recovery',
			successResponse: dummyData,
			errorResponse: errorResponse,
		},
		thunk: () => accountRecoverySettingsFetch()( spy ),
		preCondition: () =>
			expect( spy.calledWith( { type: ACCOUNT_RECOVERY_SETTINGS_FETCH } ) ).toBeTruthy(),
		postConditionSuccess: () => {
			expect(
				spy.calledWith( {
					type: ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
					settings: dummyData,
				} )
			).toBeTruthy();
		},
		postConditionFailed: () => {
			expect(
				spy.calledWith(
					sinon.match( {
						type: ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
						error: errorResponse,
					} )
				)
			).toBeTruthy();
		},
	} );

	describe( '#accountRecoverySettingsFetchSuccess()', () => {
		test( 'should return ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS', () => {
			const action = accountRecoverySettingsFetchSuccess( dummyData );
			expect( action ).toEqual( {
				type: ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
				settings: dummyData,
			} );
		} );
	} );

	describe( '#accountRecoverySettingsFetchFailed()', () => {
		test( 'should return ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED', () => {
			const action = accountRecoverySettingsFetchFailed( errorResponse );

			expect( action ).toEqual( {
				type: ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
				error: errorResponse,
			} );
		} );
	} );

	const newPhoneValue = {
		countryCode: dummyNewPhone.country_code,
		countryNumericCode: dummyNewPhone.country_numeric_code,
		number: dummyNewPhone.number,
		numberFull: dummyNewPhone.number_full,
	};

	generateSuccessAndFailedTestsForThunk( {
		testBaseName: '#updateAccountRecoveryPhone',
		nockSettings: {
			method: 'post',
			endpoint: '/rest/v1.1/me/account-recovery/phone',
			successResponse: { success: true },
			errorResponse: errorResponse,
		},
		thunk: () => updateAccountRecoveryPhone( newPhoneValue )( spy ),
		preCondition: () =>
			expect(
				spy.calledWith( {
					type: ACCOUNT_RECOVERY_SETTINGS_UPDATE,
					target: 'phone',
				} )
			).toBeTruthy(),
		postConditionSuccess: () =>
			expect(
				spy.calledWith( {
					type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
					target: 'phone',
					value: newPhoneValue,
				} )
			).toBeTruthy(),
		postConditionFailed: () =>
			expect(
				spy.calledWith(
					sinon.match( {
						type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,
						target: 'phone',
						error: errorResponse,
					} )
				)
			).toBeTruthy(),
	} );

	describe( '#updateAccountRecoveryPhoneSuccess', () => {
		test( 'should return ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS with the new phone data', () => {
			const phone = dummyData.phone;
			const action = updateAccountRecoveryPhoneSuccess( phone );

			expect( action ).toEqual( {
				type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
				target: 'phone',
				value: phone,
			} );
		} );
	} );

	describe( '#updateAccountRecoveryPhoneFailed', () => {
		test( 'should return ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED with target: phone', () => {
			const action = updateAccountRecoveryPhoneFailed( errorResponse );

			expect( action ).toEqual( {
				type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,
				target: 'phone',
				error: errorResponse,
			} );
		} );
	} );

	generateSuccessAndFailedTestsForThunk( {
		testBaseName: '#deleteAccountRecoveryPhone',
		nockSettings: {
			method: 'post',
			endpoint: '/rest/v1.1/me/account-recovery/phone/delete',
			successResponse: {},
			errorResponse: errorResponse,
		},
		thunk: () => deleteAccountRecoveryPhone()( spy ),
		preCondition: () =>
			expect(
				spy.calledWith( {
					type: ACCOUNT_RECOVERY_SETTINGS_DELETE,
					target: 'phone',
				} )
			).toBeTruthy(),
		postConditionSuccess: () =>
			expect(
				spy.calledWith( {
					type: ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
					target: 'phone',
				} )
			).toBeTruthy(),
		postConditionFailed: () =>
			expect(
				spy.calledWith(
					sinon.match( {
						type: ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
						target: 'phone',
						error: errorResponse,
					} )
				)
			).toBeTruthy(),
	} );

	describe( '#deleteAccountRecoveryPhoneSuccess', () => {
		test( 'should return ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS with target: phone', () => {
			const action = deleteAccountRecoveryPhoneSuccess();

			expect( action ).toEqual( {
				type: ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
				target: 'phone',
			} );
		} );
	} );

	describe( '#deleteAccountRecoveryPhoneFailed', () => {
		test( 'should return ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED with target: phone', () => {
			const action = deleteAccountRecoveryPhoneFailed( errorResponse );

			expect( action ).toEqual( {
				type: ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
				target: 'phone',
				error: errorResponse,
			} );
		} );
	} );

	generateSuccessAndFailedTestsForThunk( {
		testBaseName: '#updateAccountRecoveryEmail',
		nockSettings: {
			method: 'post',
			endpoint: '/rest/v1.1/me/account-recovery/email',
			successResponse: { email: dummyNewEmail },
			errorResponse: errorResponse,
		},
		thunk: () => updateAccountRecoveryEmail( dummyNewEmail )( spy ),
		preCondition: () =>
			expect(
				spy.calledWith( {
					type: ACCOUNT_RECOVERY_SETTINGS_UPDATE,
					target: 'email',
				} )
			).toBeTruthy(),
		postConditionSuccess: () => {
			expect(
				spy.calledWith( {
					type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
					target: 'email',
					value: dummyNewEmail,
				} )
			).toBeTruthy();
		},
		postConditionFailed: () => {
			expect(
				spy.calledWith(
					sinon.match( {
						type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,
						target: 'email',
						error: errorResponse,
					} )
				)
			).toBeTruthy();
		},
	} );

	describe( '#updateAccountRecoveryEmailSuccess', () => {
		test( 'should return ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS with target: email', () => {
			const action = updateAccountRecoveryEmailSuccess( dummyData.email );

			expect( action ).toEqual( {
				type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
				target: 'email',
				value: dummyData.email,
			} );
		} );
	} );

	describe( '#updateAccountRecoveryEmailFailed', () => {
		test( 'should return ACCOUNT_RECOVERY_SETTINGS_FAILED with target: email', () => {
			const action = updateAccountRecoveryEmailFailed( errorResponse );

			expect( action ).toEqual( {
				type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,
				target: 'email',
				error: errorResponse,
			} );
		} );
	} );

	generateSuccessAndFailedTestsForThunk( {
		testBaseName: '#deleteAccountRecoveryEmail',
		nockSettings: {
			method: 'post',
			endpoint: '/rest/v1.1/me/account-recovery/email/delete',
			successResponse: {},
			errorResponse: errorResponse,
		},
		thunk: () => deleteAccountRecoveryEmail()( spy ),
		preCondition: () =>
			expect(
				spy.calledWith( {
					type: ACCOUNT_RECOVERY_SETTINGS_DELETE,
					target: 'email',
				} )
			).toBeTruthy(),
		postConditionSuccess: () =>
			expect(
				spy.calledWith( {
					type: ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
					target: 'email',
				} )
			).toBeTruthy(),
		postConditionFailed: () =>
			expect(
				spy.calledWith(
					sinon.match( {
						type: ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
						target: 'email',
						error: errorResponse,
					} )
				)
			).toBeTruthy(),
	} );

	describe( '#deleteAccountRecoveryEmailSuccess', () => {
		test( 'should return ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS with target: email', () => {
			const action = deleteAccountRecoveryEmailSuccess();

			expect( action ).toEqual( {
				type: ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
				target: 'email',
			} );
		} );
	} );

	describe( '#deleteAccountRecoveryEmailFailed', () => {
		test( 'should return ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED with target: email', () => {
			const action = deleteAccountRecoveryEmailFailed( errorResponse );

			expect( action ).toEqual( {
				type: ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
				target: 'email',
				error: errorResponse,
			} );
		} );
	} );

	describe( '#resendAccountRecoveryEmailValidationSuccess', () => {
		test( 'should return ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_SUCCESS with target: email', () => {
			const action = resendAccountRecoveryEmailValidationSuccess();
			expect( action ).toEqual( {
				type: ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_SUCCESS,
				target: 'email',
			} );
		} );
	} );

	describe( '#resendAccountRecoveryEmailValidationFailed', () => {
		test( 'should return ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_FAILED with target: email', () => {
			const action = resendAccountRecoveryEmailValidationFailed( errorResponse );
			expect( action ).toEqual( {
				type: ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_FAILED,
				target: 'email',
				error: errorResponse,
			} );
		} );
	} );

	generateSuccessAndFailedTestsForThunk( {
		testBaseName: '#resendAccountRecoveryEmailValidation',
		nockSettings: {
			method: 'post',
			endpoint: '/rest/v1.1/me/account-recovery/email/validation/new',
			successResponse: { success: true },
			errorResponse: errorResponse,
		},
		thunk: () => resendAccountRecoveryEmailValidation()( spy ),
		preCondition: () =>
			expect(
				spy.calledWith( {
					type: ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION,
					target: 'email',
				} )
			).toBeTruthy(),
		postConditionSuccess: () =>
			expect(
				spy.calledWith( {
					type: ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_SUCCESS,
					target: 'email',
				} )
			).toBeTruthy(),
		postConditionFailed: () =>
			expect(
				spy.calledWith(
					sinon.match( {
						type: ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_FAILED,
						target: 'email',
						error: errorResponse,
					} )
				)
			).toBeTruthy(),
	} );

	describe( '#resendAccountRecoveryPhoneValidationSuccess', () => {
		test( 'should return ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_SUCCESS with target: phone', () => {
			const action = resendAccountRecoveryPhoneValidationSuccess();
			expect( action ).toEqual( {
				type: ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_SUCCESS,
				target: 'phone',
			} );
		} );
	} );

	describe( '#resendAccountRecoveryPhoneValidationFailed', () => {
		test( 'should return ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_FAILED with target: phone', () => {
			const action = resendAccountRecoveryPhoneValidationFailed( errorResponse );
			expect( action ).toEqual( {
				type: ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_FAILED,
				target: 'phone',
				error: errorResponse,
			} );
		} );
	} );

	generateSuccessAndFailedTestsForThunk( {
		testBaseName: '#resendAccountRecoveryPhoneValidation',
		nockSettings: {
			method: 'post',
			endpoint: '/rest/v1.1/me/account-recovery/phone/validation/new',
			successResponse: { success: true },
			errorResponse: errorResponse,
		},
		thunk: () => resendAccountRecoveryPhoneValidation()( spy ),
		preCondition: () =>
			expect(
				spy.calledWith( {
					type: ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION,
					target: 'phone',
				} )
			).toBeTruthy(),
		postConditionSuccess: () =>
			expect(
				spy.calledWith( {
					type: ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_SUCCESS,
					target: 'phone',
				} )
			).toBeTruthy(),
		postConditionFailed: () =>
			expect(
				spy.calledWith(
					sinon.match( {
						type: ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_FAILED,
						target: 'phone',
						error: errorResponse,
					} )
				)
			).toBeTruthy(),
	} );

	describe( '#validateAccountRecoveryPhoneSuccess', () => {
		test( 'should return ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS', () => {
			const action = validateAccountRecoveryPhoneSuccess();
			expect( action ).toEqual( {
				type: ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS,
			} );
		} );
	} );

	describe( '#validateAccountRecoveryPhoneFailed', () => {
		test( 'should return ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_FAILED', () => {
			const action = validateAccountRecoveryPhoneFailed( errorResponse );
			expect( action ).toEqual( {
				type: ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_FAILED,
				error: errorResponse,
			} );
		} );
	} );

	generateSuccessAndFailedTestsForThunk( {
		testBaseName: '#validateAccountRecoveryPhone',
		nockSettings: {
			method: 'post',
			endpoint: '/rest/v1.1/me/account-recovery/phone/validation',
			successResponse: { success: true },
			errorResponse: errorResponse,
		},
		thunk: () => validateAccountRecoveryPhone()( spy ),
		preCondition: () =>
			expect(
				spy.calledWith( {
					type: ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE,
				} )
			).toBeTruthy(),
		postConditionSuccess: () =>
			expect(
				spy.calledWith( {
					type: ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS,
				} )
			).toBeTruthy(),
		postConditionFailed: () =>
			expect(
				spy.calledWith(
					sinon.match( {
						type: ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_FAILED,
						error: errorResponse,
					} )
				)
			).toBeTruthy(),
	} );
} );
