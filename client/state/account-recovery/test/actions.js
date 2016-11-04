/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { useNock } from 'test/helpers/use-nock';
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
} from '../actions';

import {
	ACCOUNT_RECOVERY_FETCH,
	ACCOUNT_RECOVERY_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_FETCH_FAILED,

	ACCOUNT_RECOVERY_PHONE_UPDATE,
	ACCOUNT_RECOVERY_PHONE_UPDATE_SUCCESS,
	ACCOUNT_RECOVERY_PHONE_UPDATE_FAILED,

	ACCOUNT_RECOVERY_PHONE_DELETE,
	ACCOUNT_RECOVERY_PHONE_DELETE_SUCCESS,
	ACCOUNT_RECOVERY_PHONE_DELETE_FAILED,

	ACCOUNT_RECOVERY_EMAIL_UPDATE,
	ACCOUNT_RECOVERY_EMAIL_UPDATE_SUCCESS,
	ACCOUNT_RECOVERY_EMAIL_UPDATE_FAILED,
} from 'state/action-types';

import dummyData from './test-data';
import { generateSuccessAndFailedTestsForThunk } from './util';

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
		preCondition: () => assert( spy.calledWith( { type: ACCOUNT_RECOVERY_FETCH } ) ),
		postConditionSuccess: () => {
			assert( spy.calledWith( {
				type: ACCOUNT_RECOVERY_FETCH_SUCCESS,
				...dummyData,
			} ) );
		},
		postConditionFailed: () => {
			assert( spy.calledWith( {
				type: ACCOUNT_RECOVERY_FETCH_FAILED,
				error: errorResponse,
			} ) );
		},
	} );

	describe( '#accountRecoveryFetchSuccess()', () => {
		it( 'should return ACCOUNT_RECOVERY_FETCH_SUCCESS', () => {
			const action = accountRecoveryFetchSuccess( dummyData );
			assert.deepEqual( action, {
				type: ACCOUNT_RECOVERY_FETCH_SUCCESS,
				...dummyData,
			} );
		} );
	} );

	describe( '#accountRecoveryFetchFailed()', () => {
		it( 'should return ACCOUNT_RECOVERY_FETCH_FAILED', () => {
			const dummyError = 'failed';
			const action = accountRecoveryFetchFailed( dummyError );

			assert.deepEqual( action, {
				type: ACCOUNT_RECOVERY_FETCH_FAILED,
				error: dummyError,
			} );
		} );
	} );

	const newPhoneData = {
		country_code: 'US',
		country_numeric_code: '+1',
		number: '8881234567',
		number_full: '+18881234567',
	};

	generateSuccessAndFailedTestsForThunk( {
		testBaseName: '#updateAccountRecoveryPhone',
		nockSettings: {
			method: 'post',
			endpoint: '/rest/v1.1/me/account-recovery/phone',
			successResponse: newPhoneData,
			errorResponse: errorResponse,
		},
		thunk: () => updateAccountRecoveryPhone( newPhoneData.country_code, newPhoneData.number )( spy ),
		preCondition: () => assert( spy.calledWith( { type: ACCOUNT_RECOVERY_PHONE_UPDATE } ) ),
		postConditionSuccess: () => {
			assert( spy.calledWith( {
				type: ACCOUNT_RECOVERY_PHONE_UPDATE_SUCCESS,
				phone: newPhoneData,
			} ) );
		},
		postConditionFailed: () => {
			assert( spy.calledWith( {
				type: ACCOUNT_RECOVERY_PHONE_UPDATE_FAILED,
				error: errorResponse,
			} ) );
		},
	} );

	describe( '#updateAccountRecoveryPhoneSuccess', () => {
		it( 'should return ACCOUNT_RECOVERY_PHONE_UPDATE_SUCCESS', () => {
			const phone = dummyData.phone;
			const action = updateAccountRecoveryPhoneSuccess( phone );

			assert.deepEqual( action, {
				type: ACCOUNT_RECOVERY_PHONE_UPDATE_SUCCESS,
				phone,
			} );
		} );
	} );

	describe( '#updateAccountRecoveryPhoneFailed', () => {
		it( 'should return ACCOUNT_RECOVERY_PHONE_UPDATE_FAILED', () => {
			const dummyError = 'failed';
			const action = updateAccountRecoveryPhoneFailed( dummyError );

			assert.deepEqual( action, {
				type: ACCOUNT_RECOVERY_PHONE_UPDATE_FAILED,
				error: dummyError,
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
		preCondition: () => assert( spy.calledWith( { type: ACCOUNT_RECOVERY_PHONE_DELETE } ) ),
		postConditionSuccess: () => assert( spy.calledWith( { type: ACCOUNT_RECOVERY_PHONE_DELETE_SUCCESS } ) ),
		postConditionFailed: () => {
			assert( spy.calledWith( {
				type: ACCOUNT_RECOVERY_PHONE_DELETE_FAILED,
				error: errorResponse,
			} ) );
		},
	} );

	describe( '#deleteAccountRecoveryPhoneSuccess', () => {
		it( 'should return ACCOUNT_RECOVERY_PHONE_DELETE_SUCCESS', () => {
			const action = deleteAccountRecoveryPhoneSuccess();

			assert.deepEqual( action, {
				type: ACCOUNT_RECOVERY_PHONE_DELETE_SUCCESS,
			} );
		} );
	} );

	describe( '#deleteAccountRecoveryPhoneFailed', () => {
		it( 'should return ACCOUNT_RECOVERY_PHONE_DELETE_FAILED', () => {
			const dummyError = 'failed';
			const action = deleteAccountRecoveryPhoneFailed( dummyError );

			assert.deepEqual( action, {
				type: ACCOUNT_RECOVERY_PHONE_DELETE_FAILED,
				error: dummyError,
			} );
		} );
	} );

	describe( '#updateAccountRecoveryEmail', () => {
		const newEmail = { email: 'newtest@a8ctest.com' };

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/me/account-recovery/email' )
				.reply( 200, newEmail );
		} );

		it( 'should dispatch update / success actions', () => {
			const update = updateAccountRecoveryEmail( newEmail )( spy );

			assert( spy.calledWith( { type: ACCOUNT_RECOVERY_EMAIL_UPDATE } ) );

			return update.then( () => {
				assert( spy.calledWith( {
					type: ACCOUNT_RECOVERY_EMAIL_UPDATE_SUCCESS,
					email: newEmail,
				} ) );
			} );
		} );
	} );

	describe( '#updateAccountRecoveryEmailSuccess', () => {
		it( 'should return ACCOUNT_RECOVERY_EMAIL_UPDATE_SUCCESS', () => {
			const action = updateAccountRecoveryEmailSuccess( dummyData.email );

			assert.deepEqual( action, {
				type: ACCOUNT_RECOVERY_EMAIL_UPDATE_SUCCESS,
				email: dummyData.email,
			} );
		} );
	} );

	describe( '#updateAccountRecoveryEmailFailed', () => {
		it( 'should return ACCOUNT_RECOVERY_EMAIL_FAILED', () => {
			const dummyError = 'failed';
			const action = updateAccountRecoveryEmailFailed( dummyError );

			assert.deepEqual( action, {
				type: ACCOUNT_RECOVERY_EMAIL_UPDATE_FAILED,
				error: dummyError,
			} );
		} );
	} );
} );
