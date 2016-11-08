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

import { dummyData, dummyNewPhone, dummyNewEmail } from './test-data';
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

	it( 'ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS action with email target should update the email field', () => {
		const state = reducer( initState, {
			type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
			target: 'email',
			data: dummyNewEmail,
		} );

		assert.deepEqual( state.data.email, dummyNewEmail );
	} );
} );

describe( '#account-recovery reducer action status flags: ', () => {
	generateActionInProgressStateFlagTests(
		'isFetching',
		reducer,
		[ ACCOUNT_RECOVERY_SETTINGS_FETCH ],
		[ ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS, ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED ]
	);

	generateActionInProgressStateFlagTests(
		'isUpdatingPhone',
		reducer,
		[ ACCOUNT_RECOVERY_SETTINGS_UPDATE ],
		[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS, ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED ]
	);

	generateActionInProgressStateFlagTests(
		'isDeletingPhone',
		reducer,
		[ ACCOUNT_RECOVERY_SETTINGS_DELETE ],
		[ ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS, ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED ]
	);

	generateActionInProgressStateFlagTests(
		'isUpdatingEmail',
		reducer,
		[ ACCOUNT_RECOVERY_SETTINGS_UPDATE ],
		[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS, ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED ]
	);
} );
