/**
 * External dependencies
 */
import { assert } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
	ACCOUNT_RECOVERY_RESET_REQUEST,
	ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
	ACCOUNT_RECOVERY_RESET_PICK_METHOD,
} from 'state/action-types';

import reducer from '../reducer';

describe( '#account-recovery/reset reducer', () => {
	const fetchedOptions = deepFreeze( [
		{
			email: 'primary@example.com',
			sms: '123456789',
		},
		{
			email: 'secondary@example.com',
			sms: '123456789',
		},
	] );

	it( 'ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST action should set isRequesting flag.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST
		} );

		assert.isTrue( state.options.isRequesting );
	} );

	const hasItemsState = deepFreeze( {
		options: {
			items: fetchedOptions,
		},
	} );

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

	const requestingState = deepFreeze( {
		options: {
			isRequesting: true,
		},
	} );

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

	const mockError = deepFreeze( {
		status: 400,
		message: 'Something wrong!',
	} );

	it( 'ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR action should populate the error field.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
			error: mockError,
		} );

		assert.deepEqual( state.options.error, mockError );
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

	it( 'ACCOUNT_RECOVERY_RESET_PICK_METHOD action should populate the method field', () => {
		const method = 'primary_email';
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_PICK_METHOD,
			method,
		} );

		assert.equal( state.method, method );
	} );

	it( 'ACCOUNT_RECOVERY_RESET_REQUEST action should set the requesting status flag', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST,
		} );

		assert.isTrue( state.requestReset.isRequesting );
	} );

	const requestingResetState = deepFreeze( {
		requestReset: {
			isRequesting: true,
		},
	} );

	it( 'ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS action should unset the requesting status flag', () => {
		const state = reducer( requestingResetState, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
		} );

		assert.isFalse( state.requestReset.isRequesting );
	} );

	it( 'ACCOUNT_RECOVERY_RESET_REQUEST_ERROR action should unset the requesting status flag', () => {
		const state = reducer( requestingResetState, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
			error: {},
		} );

		assert.isFalse( state.requestReset.isRequesting );
	} );

	it( 'ACCOUNT_RECOVERY_RESET_REQUEST_ERROR action should populate the error field', () => {
		const state = reducer( requestingResetState, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
			error: mockError,
		} );

		assert.deepEqual( state.requestReset.error, mockError );
	} );
} );
