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
} from 'state/action-types';

import dummyData from './test-data';

describe( 'account-recovery actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	describe( '#accountRecoveryFetch() success', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/me/account-recovery' )
				.reply( 200, dummyData );
		} );

		it( 'should dispatch fetch / success actions.', () => {
			const fetch = accountRecoveryFetch()( spy );

			assert( spy.calledWith( { type: ACCOUNT_RECOVERY_FETCH } ) );

			return fetch.then( () => {
				assert( spy.calledWith( {
					type: ACCOUNT_RECOVERY_FETCH_SUCCESS,
					...dummyData,
				} ) );
			} );
		} );
	} );

	describe( '#accountRecoveryFetch() failed', () => {
		const message = 'something wrong!';

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/me/account-recovery' )
				.reply( 400, { message } );
		} );

		it( 'should dispatch fetch / fail actions.', () => {
			const fetch = accountRecoveryFetch()( spy );

			assert( spy.calledWith( { type: ACCOUNT_RECOVERY_FETCH } ) );

			return fetch.then( () => {
				assert( spy.calledWith( {
					type: ACCOUNT_RECOVERY_FETCH_FAILED,
					error: {
						status: 400,
						message,
					},
				} ) );
			} );
		} );
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

	describe( '#updateAccountRecoveryPhone', () => {
		const newPhoneData = {
			country_code: 'US',
			country_numeric_code: '+1',
			number: '8881234567',
			number_full: '+18881234567',
		};

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/me/account-recovery/phone' )
				.reply( 200, newPhoneData );
		} );

		it( 'should dispatch update / success actions.', () => {
			const update = updateAccountRecoveryPhone( newPhoneData.country_code, newPhoneData.number )( spy );

			assert( spy.calledWith( { type: ACCOUNT_RECOVERY_PHONE_UPDATE } ) );

			return update.then( () => {
				assert( spy.calledWith( {
					type: ACCOUNT_RECOVERY_PHONE_UPDATE_SUCCESS,
					phone: newPhoneData,
				} ) );
			} );
		} );
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

	describe( '#deleteAccountRecoveryPhone', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/me/account-recovery/phone/delete' )
				.reply( 200 );
		} );

		it( 'should dispatch delete / success actions', () => {
			const del = deleteAccountRecoveryPhone()( spy );

			assert( spy.calledWith( { type: ACCOUNT_RECOVERY_PHONE_DELETE } ) );

			return del.then( () => {
				assert( spy.calledWith( { type: ACCOUNT_RECOVERY_PHONE_DELETE_SUCCESS } ) );
			} );
		} );
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
} );
