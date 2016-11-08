/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';

import {
	accountRecoveryFetch,
	accountRecoveryFetchSuccess,
	accountRecoveryFetchFailed,

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
} from '../actions';

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
} from 'state/action-types';

import { dummyData, dummyNewPhone, dummyNewEmail } from './test-data';
import { generateSuccessAndFailedTestsForThunk } from './utils';

describe( 'account-recovery actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	const errorResponse = { status: 400, message: 'Something wrong!' };

	generateSuccessAndFailedTestsForThunk( {
		testBaseName: '#accountRecoveryFetch',
		nockSettings: {
			method: 'get',
			endpoint: '/rest/v1.1/me/account-recovery',
			successResponse: dummyData,
			errorResponse: errorResponse,
		},
		thunk: () => accountRecoveryFetch()( spy ),
		preCondition: () => assert( spy.calledWith( { type: ACCOUNT_RECOVERY_SETTINGS_FETCH } ) ),
		postConditionSuccess: () => {
			assert( spy.calledWith( {
				type: ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
				...dummyData,
			} ) );
		},
		postConditionFailed: () => {
			assert( spy.calledWith( {
				type: ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
				error: errorResponse,
			} ) );
		},
	} );

	describe( '#accountRecoveryFetchSuccess()', () => {
		it( 'should return ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS', () => {
			const action = accountRecoveryFetchSuccess( dummyData );
			assert.deepEqual( action, {
				type: ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
				...dummyData,
			} );
		} );
	} );

	describe( '#accountRecoveryFetchFailed()', () => {
		it( 'should return ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED', () => {
			const action = accountRecoveryFetchFailed( errorResponse );

			assert.deepEqual( action, {
				type: ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
				error: errorResponse,
			} );
		} );
	} );

	generateSuccessAndFailedTestsForThunk( {
		testBaseName: '#updateAccountRecoveryPhone',
		nockSettings: {
			method: 'post',
			endpoint: '/rest/v1.1/me/account-recovery/phone',
			successResponse: dummyNewPhone,
			errorResponse: errorResponse,
		},
		thunk: () => updateAccountRecoveryPhone( dummyNewPhone.country_code, dummyNewPhone.number )( spy ),
		preCondition: () =>
			assert( spy.calledWith( {
				type: ACCOUNT_RECOVERY_SETTINGS_UPDATE,
				target: 'phone',
			} ) ),
		postConditionSuccess: () =>
			assert( spy.calledWith( {
				type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
				target: 'phone',
				data: dummyNewPhone,
			} ) ),
		postConditionFailed: () =>
			assert( spy.calledWith( {
				type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,
				target: 'phone',
				error: errorResponse,
			} ) ),
	} );

	describe( '#updateAccountRecoveryPhoneSuccess', () => {
		it( 'should return ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS with the new phone data', () => {
			const phone = dummyData.phone;
			const action = updateAccountRecoveryPhoneSuccess( phone );

			assert.deepEqual( action, {
				type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
				target: 'phone',
				value: phone,
			} );
		} );
	} );

	describe( '#updateAccountRecoveryPhoneFailed', () => {
		it( 'should return ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED with target: phone', () => {
			const action = updateAccountRecoveryPhoneFailed( errorResponse );

			assert.deepEqual( action, {
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
			assert( spy.calledWith( {
				type: ACCOUNT_RECOVERY_SETTINGS_DELETE,
				target: 'phone',
			} ) ),
		postConditionSuccess: () =>
			assert( spy.calledWith( {
				type: ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
				target: 'phone',
			} ) ),
		postConditionFailed: () =>
			assert( spy.calledWith( {
				type: ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
				target: 'phone',
				error: errorResponse,
			} ) ),
	} );

	describe( '#deleteAccountRecoveryPhoneSuccess', () => {
		it( 'should return ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS with target: phone', () => {
			const action = deleteAccountRecoveryPhoneSuccess();

			assert.deepEqual( action, {
				type: ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
				target: 'phone',
			} );
		} );
	} );

	describe( '#deleteAccountRecoveryPhoneFailed', () => {
		it( 'should return ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED with target: phone', () => {
			const action = deleteAccountRecoveryPhoneFailed( errorResponse );

			assert.deepEqual( action, {
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
			assert( spy.calledWith( {
				type: ACCOUNT_RECOVERY_SETTINGS_UPDATE,
				target: 'email',
			} ) ),
		postConditionSuccess: () => {
			assert( spy.calledWith( {
				type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
				target: 'email',
				data: dummyNewEmail,
			} ) );
		},
		postConditionFailed: () => {
			assert( spy.calledWith( {
				type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,
				target: 'email',
				error: errorResponse,
			} ) );
		},
	} );

	describe( '#updateAccountRecoveryEmailSuccess', () => {
		it( 'should return ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS with target: email', () => {
			const action = updateAccountRecoveryEmailSuccess( dummyData.email );

			assert.deepEqual( action, {
				type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
				target: 'email',
				value: dummyData.email,
			} );
		} );
	} );

	describe( '#updateAccountRecoveryEmailFailed', () => {
		it( 'should return ACCOUNT_RECOVERY_SETTINGS_FAILED with target: email', () => {
			const action = updateAccountRecoveryEmailFailed( errorResponse );

			assert.deepEqual( action, {
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
			assert( spy.calledWith( {
				type: ACCOUNT_RECOVERY_SETTINGS_DELETE,
				target: 'email',
			} ) ),
		postConditionSuccess: () =>
			assert( spy.calledWith( {
				type: ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
				target: 'email',
			} ) ),
		postConditionFailed: () =>
			assert( spy.calledWith( {
				type: ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
				target: 'email',
				error: errorResponse,
			} ) ),
	} );

	describe( '#deleteAccountRecoveryEmailSuccess', () => {
		it( 'should return ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS with target: email', () => {
			const action = deleteAccountRecoveryEmailSuccess();

			assert.deepEqual( action, {
				type: ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
				target: 'email',
			} );
		} );
	} );

	describe( '#deleteAccountRecoveryEmailFailed', () => {
		it( 'should return ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED with target: email', () => {
			const action = deleteAccountRecoveryEmailFailed( errorResponse );

			assert.deepEqual( action, {
				type: ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
				target: 'email',
				error: errorResponse,
			} );
		} );
	} );
} );
