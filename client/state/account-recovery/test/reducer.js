/**
 * External dependencies
 */
import { assert } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */

import {
	ACCOUNT_RECOVERY_FETCH,
	ACCOUNT_RECOVERY_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_FETCH_FAILED,
} from 'state/action-types';

import dummyData from './test-data';
import reducer from '../reducer';

describe( 'account-recovery reducer', () => {
	const expectedState = {
		email: dummyData.email,
		emailValidated: dummyData.email_validated,
		phone: dummyData.phone,
		phoneValidated: dummyData.phone_validated,
		isFetching: false,
	};

	it( 'should return an initial object with the settings data.', () => {
		const initState = reducer( null, {
			type: ACCOUNT_RECOVERY_FETCH_SUCCESS,
			...dummyData,
		} );

		assert.deepEqual( initState, expectedState );
	} );

	it( 'should return a new state object with the settings data.', () => {
		const prevState = deepFreeze( {
			foo: '1',
			bar: 'bar',
		} );

		const state = reducer( prevState, {
			type: ACCOUNT_RECOVERY_FETCH_SUCCESS,
			...dummyData,
		} );

		assert.deepEqual( state, {
			...prevState,
			...expectedState,
		} );
	} );

	it( 'should populate isFetching in the state', () => {
		const state = reducer( null, {
			type: ACCOUNT_RECOVERY_FETCH,
		} );

		assert( state.isFetching );
	} );

	it( 'ACCOUNT_RECOVERY_FETCH_SUCCESS action should set isFetching to false', () => {
		const state = reducer( { isFetching: true }, {
			type: ACCOUNT_RECOVERY_FETCH_SUCCESS,
			...dummyData,
		} );

		assert.isFalse( state.isFetching );
	} );

	it( 'ACCOUNT_RECOVERY_FETCH_FAILED action should set isFetching to false', () => {
		const state = reducer( { isFetching: true }, {
			type: ACCOUNT_RECOVERY_FETCH_FAILED,
		} );

		assert.isFalse( state.isFetching );
	} );
} );
