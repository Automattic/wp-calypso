/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import {
	fetchResetOptionsByLogin,
	fetchResetOptionsByNameAndUrl,
	updatePasswordResetUserData,
} from '../actions';

import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
} from 'state/action-types';

describe( '#fetchResetOptionsByLogin', () => {
	it( 'should return ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST action with the user field', () => {
		const user = 'foo';
		const action = fetchResetOptionsByLogin( user );

		assert.deepEqual( action, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
			userData: {
				user,
			},
		} );
	} );
} );

describe( '#fetchResetOptionsByNameAndUrl', () => {
	it( 'should return ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST action with the firstname, lastname and url fields. ', () => {
		const firstname = 'firstname';
		const lastname = 'lastname';
		const url = 'example.com';

		const action = fetchResetOptionsByNameAndUrl( firstname, lastname, url );

		assert.deepEqual( action, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
			userData: {
				firstname,
				lastname,
				url,
			},
		} );
	} );
} );

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
