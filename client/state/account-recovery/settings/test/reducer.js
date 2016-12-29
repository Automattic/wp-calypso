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

	ACCOUNT_RECOVERY_SETTINGS_UPDATE,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,

	ACCOUNT_RECOVERY_SETTINGS_DELETE,
	ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
} from 'state/action-types';

import { dummyData, dummyNewPhone } from './test-data';
import { generateActionInProgressStateFlagTests } from './utils';
import reducer from '../reducer';

describe( '#account-recovery reducer fetch:', () => {
	const expectedState = {
		data: {
			email: dummyData.email,
			emailValidated: dummyData.email_validated,
			phone: dummyData.phone,
			phoneValidated: dummyData.phone_validated,
		},
		isFetching: false,
		isUpdatingPhone: false,
		isDeletingPhone: false,
		isUpdatingEmail: false,
	};

	it( 'should return an initial object with the settings data.', () => {
		const initState = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
			...dummyData,
		} );

		assert.deepEqual( initState, expectedState );
	} );
} );

describe( '#account-recovery reducer update / delete:', () => {
	let initState;

	beforeEach( () => {
		initState = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
			...dummyData,
		} );
	} );

	it( 'ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS action with phone target should update the phone field', () => {
		const state = reducer( initState, {
			type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
			target: 'phone',
			data: dummyNewPhone,
		} );

		assert.deepEqual( state.data, {
			...initState.data,
			phone: dummyNewPhone,
		} );
	} );

	it( 'ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS action with phone target should wipe the phone field', () => {
		const state = reducer( initState, {
			type: ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
			target: 'phone',
		} );

		assert.deepEqual( state.data.phone, {} );
	} );
} );

describe( '#account-recovery reducer action status flags: ', () => {
	generateActionInProgressStateFlagTests(
		'isFetching',
		reducer,
		[ ACCOUNT_RECOVERY_SETTINGS_FETCH ],
		[ ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS, ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED ]
	);

	it( 'ACCOUNT_RECOVERY_SETTINGS_UPDATE action should set isUpdatingPhone to true', () => {
		const state = reducer( { isUpdatingPhone: true }, {
			type: ACCOUNT_RECOVERY_SETTINGS_UPDATE,
			target: 'phone',
		} );

		assert.isTrue( state.isUpdatingPhone );
	} );

	it( 'ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED action should set isUpdatingPhone to false', () => {
		const state = reducer( { isUpdatingPhone: true }, {
			type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,
		} );

		assert.isFalse( state.isUpdatingPhone );
	} );

	it( 'ACCOUNT_RECOVERY_SETTINGS_DELETE action should set isDeletingPhone to true', () => {
		const state = reducer( { isDeletingPhone: false }, {
			type: ACCOUNT_RECOVERY_SETTINGS_DELETE,
		} );

		assert.isTrue( state.isDeletingPhone );
	} );

	it( 'ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS action should set isDeletingPhone to false', () => {
		const state = reducer( { isDeletingPhone: true }, {
			type: ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
		} );

		assert.isFalse( state.isDeletingPhone );
	} );

	it( 'ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED action should set isDeletingPhone to false', () => {
		const state = reducer( { isDeletingPhone: true }, {
			type: ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
		} );

		assert.isFalse( state.isDeletingPhone );
	} );
} );
