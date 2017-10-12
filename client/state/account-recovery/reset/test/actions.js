/** @format */

/**
 * External dependencies
 */
import { requestReset, updatePasswordResetUserData, setResetMethod } from '../actions';
import {
	ACCOUNT_RECOVERY_RESET_SET_METHOD,
	ACCOUNT_RECOVERY_RESET_REQUEST,
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
} from 'state/action-types';

describe( '#updatePasswordResetUserData', () => {
	test( 'should return ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA action', () => {
		const userData = {
			user: 'foo',
			firstName: 'Foo',
			lastName: 'Bar',
			url: 'test.example.com',
		};
		const action = updatePasswordResetUserData( userData );

		expect( action ).toEqual( {
			type: ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
			userData,
		} );
	} );
} );

describe( '#requestReset', () => {
	test( 'should return action ACCOUNT_RECOVERY_RESET_REQUET_RESET', () => {
		const userData = { user: 'foo' };
		const method = 'primary_email';

		const action = requestReset( userData, method );

		expect( action ).toEqual( {
			type: ACCOUNT_RECOVERY_RESET_REQUEST,
			userData,
			method,
		} );
	} );
} );

describe( '#setResetMethod', () => {
	test( 'should return action ACCOUNT_RECOVERY_RESET_SET_METHOD', () => {
		const method = 'primary_email';
		const action = setResetMethod( method );

		expect( action ).toEqual( {
			type: ACCOUNT_RECOVERY_RESET_SET_METHOD,
			method,
		} );
	} );
} );
