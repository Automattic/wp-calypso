/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import {
	requestReset,
	requestResetSuccess,
	requestResetError,
	updatePasswordResetUserData,
	pickResetMethod,
} from '../actions';

import {
	ACCOUNT_RECOVERY_RESET_PICK_METHOD,
	ACCOUNT_RECOVERY_RESET_REQUEST,
	ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
} from 'state/action-types';

describe( '#updatePasswordResetUserData', () => {
	it( 'should return ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA action', () => {
		const userData = {
			user: 'foo',
			firstName: 'Foo',
			lastName: 'Bar',
			url: 'test.example.com',
		};
		const action = updatePasswordResetUserData( userData );

		assert.deepEqual( action, {
			type: ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
			userData,
		} );
	} );
} );

describe( '#requestResetSuccess', () => {
	it( 'should return action ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS', () => {
		const action = requestResetSuccess();

		assert.deepEqual( action, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
		} );
	} );
} );

describe( '#requestResetError', () => {
	it( 'should return action ACCOUNT_RECOVERY_RESET_REQUEST_ERROR with error field', () => {
		const error = {
			status: 404,
			message: 'Error!',
		};

		const action = requestResetError( error );

		assert.deepEqual( action, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
			error,
		} );
	} );
} );

describe( '#requestReset', () => {
	it( 'should return action ACCOUNT_RECOVERY_RESET_REQUET_RESET', () => {
		const request = {
			user: 'foo',
			method: 'primary_email',
		};

		const action = requestReset( request );

		assert.deepEqual( action, {
			type: ACCOUNT_RECOVERY_RESET_REQUEST,
			request,
		} );
	} );
} );

describe( '#pickResetMethod', () => {
	it( 'should return action ACCOUNT_RECOVERY_RESET_PICK_METHOD', () => {
		const method = 'primary_email';
		const action = pickResetMethod( method );

		assert.deepEqual( action, {
			type: ACCOUNT_RECOVERY_RESET_PICK_METHOD,
			method,
		} );
	} );
} );
