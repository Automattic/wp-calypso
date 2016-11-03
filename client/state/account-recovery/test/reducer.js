/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */

import {
	ACCOUNT_RECOVERY_FETCH_SUCCESS,
} from 'state/action-types';

import dummyData from './test-data';
import reducer from '../reducer';

describe( 'account-recovery reducer', () => {
	const camelDummyData = {
		email: dummyData.email,
		emailValidated: dummyData.email_validated,
		phone: dummyData.phone,
		phoneValidated: dummyData.phone_validated,
	};

	it( 'should return an initial object with the settings data.', () => {
		const initState = reducer( null, {
			type: ACCOUNT_RECOVERY_FETCH_SUCCESS,
			accountRecoverySettings: dummyData,
		} );

		assert.deepEqual( initState, camelDummyData );
	} );

	it( 'should return a new state object with the settings data.', () => {
		const prevState = {
			foo: '1',
			bar: 'bar',
		};

		const state = reducer( prevState, {
			type: ACCOUNT_RECOVERY_FETCH_SUCCESS,
			accountRecoverySettings: dummyData,
		} );

		assert.deepEqual( state, {
			...prevState,
			...camelDummyData,
		} );
	} );
} );
