/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import {
	ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
	ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_REQUEST,
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
} from 'state/action-types';

import reducer from '../reducer';

describe( '#account-recovery/reset reducer', () => {
	it( 'ACCOUNT_RECOVERY_RESET_REQUEST action should set isRequesting subfield.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST,
			target: 'requestOptions',
		} );

		assert.isTrue( state.isRequesting.requestOptions );
	} );

	const requestingState = {
		isRequesting: {
			requestOptions: true,
		}
	};

	it( 'ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS action should unset isRequesting flag.', () => {
		const state = reducer( requestingState, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
			target: 'requestOptions',
			items: [],
		} );

		assert.isFalse( state.isRequesting.requestOptions );
	} );

	it( 'ACCOUNT_RECOVERY_RESET_REQUEST_ERROR action should unset isRequesting flag.', () => {
		const state = reducer( requestingState, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
			target: 'requestOptions',
			error: {},
		} );

		assert.isFalse( state.isRequesting.requestOptions );
	} );

	it( 'ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS action should populate the items field.', () => {
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
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
			target: 'resetOptions',
			items: fetchedOptions,
		} );

		assert.deepEqual( state.items, fetchedOptions );
	} );

	it( 'ACCOUNT_RECOVERY_RESET_REQUEST_ERROR action should populate the error field.', () => {
		const fetchError = {
			status: 400,
			message: 'Something wrong!',
		};

		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
			target: 'requestOptions',
			error: fetchError,
		} );

		assert.deepEqual( state.error.requestOptions, fetchError );
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
