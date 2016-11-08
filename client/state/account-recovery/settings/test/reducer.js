/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */

import {
	ACCOUNT_RECOVERY_SETTINGS_FETCH,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
} from 'state/action-types';

import dummyData from './test-data';
import reducer from '../reducer';

describe( 'account-recovery reducer', () => {
	const expectedState = {
		data: {
			email: dummyData.email,
			emailValidated: dummyData.email_validated,
			phone: dummyData.phone,
			phoneValidated: dummyData.phone_validated,
		},
		isFetching: false,
		isUpdatingPhone: false,
	};

	it( 'should return an initial object with the settings data.', () => {
		const initState = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
			...dummyData,
		} );

		assert.deepEqual( initState, expectedState );
	} );

	it( 'should populate isFetching in the state', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_FETCH,
		} );

		assert( state.isFetching );
	} );

	it( 'ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS action should set isFetching to false', () => {
		const state = reducer( { isFetching: true }, {
			type: ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
			...dummyData,
		} );

		assert.isFalse( state.isFetching );
	} );

	it( 'ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED action should set isFetching to false', () => {
		const state = reducer( { isFetching: true }, {
			type: ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
		} );

		assert.isFalse( state.isFetching );
	} );
} );
