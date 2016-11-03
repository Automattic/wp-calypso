/**
 * External dependencies
 */
import { assert } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { useNock } from 'test/helpers/use-nock';

import {
	accountRecoveryFetch,
	accountRecoveryFetchSuccess,
	accountRecoveryFetchFailed,
} from '../actions';

import {
	ACCOUNT_RECOVERY_FETCH,
	ACCOUNT_RECOVERY_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_FETCH_FAILED,
} from '../../action-types';

describe( 'account-recovery ctions', () => {
	const dummyData = {
		email: 'dummytest@a8ctest.com',
		email_validated: false,
		phone: {
			country_code: 'TW',
			country_numeric_code: '+886',
			number: '0918000000',
			number_full: '+886918000000',
		},
		phone_validated: false,
	};

	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#accountRecoveryFetch()', () => {
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
					accountRecoverySettings: dummyData,
				} ) );
			} );
		} );
	} );

	describe( '#accountRecoveryFetchSuccess()', () => {
		it( 'should return ACCOUNT_RECOVERY_FETCH_SUCCESS', () => {
			const action = accountRecoveryFetchSuccess( dummyData );
			assert.deepEqual( action, {
				type: ACCOUNT_RECOVERY_FETCH_SUCCESS,
				accountRecoverySettings: dummyData,
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
} );
