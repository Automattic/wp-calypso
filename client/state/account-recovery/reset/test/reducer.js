/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
} from 'state/action-types';

import reducer from '../reducer';

describe( '#account-recovery/reset reducer', () => {
	const fetchedOptions = [
		{
			email: 'primary@example.com',
			sms: '123456789',
		},
		{
			email: 'secondary@example.com',
			sms: '123456789',
		},
	];

	it( 'ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST action should set isRequesting flag.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST
		} );

		assert.isTrue( state.options.isRequesting );
	} );

	const hasItemsState = {
		options: {
			items: fetchedOptions,
		},
	};

	it( 'ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST action should delete the previous items.', () => {
		const state = reducer( hasItemsState, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
		} );

		assert.deepEqual( state.options.items, [] );
	} );

	it( 'ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR action should delete the previous items.', () => {
		const state = reducer( hasItemsState, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
			error: {},
		} );

		assert.deepEqual( state.options.items, [] );
	} );

	const requestingState = {
		options: {
			isRequesting: true,
		},
	};

	it( 'ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE action should unset isRequesting flag.', () => {
		const state = reducer( requestingState, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
			items: [],
		} );

		assert.isFalse( state.options.isRequesting );
	} );

	it( 'ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR action should unset isRequesting flag.', () => {
		const state = reducer( requestingState, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
			error: {},
		} );

		assert.isFalse( state.options.isRequesting );
	} );

	it( 'ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE action should populate the items field.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
			items: fetchedOptions,
		} );

		assert.deepEqual( state.options.items, fetchedOptions );
	} );

	it( 'ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR action should populate the error field.', () => {
		const fetchError = {
			status: 400,
			message: 'Something wrong!',
		};

		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
			error: fetchError,
		} );

		assert.deepEqual( state.options.error, fetchError );
	} );

	it( 'ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA action should populate the user field.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
			userData: {
				user: 'userlogin',
			},
		} );

		assert.equal( state.userData.user, 'userlogin' );
	} );

	it( 'ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA action should populate the firstname field.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
			userData: {
				firstName: 'Foo',
			},
		} );

		assert.equal( state.userData.firstName, 'Foo' );
	} );

	it( 'ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA action should populate the lastname field.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
			userData: {
				lastName: 'Bar',
			},
		} );

		assert.equal( state.userData.lastName, 'Bar' );
	} );

	it( 'ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA action should populate the url field.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
			userData: {
				url: 'examples.com',
			},
		} );

		assert.equal( state.userData.url, 'examples.com' );
	} );

	it( 'ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA action should not populate any unexpected field.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
			userData: {
				unexpected: 'random-value',
			},
		} );

		assert.deepEqual( state.userData, {} );
	} );
} );
