/**
 * Internal dependencies
 */
import { ACCOUNT_CLOSE, ACCOUNT_CLOSE_SUCCESS } from 'calypso/state/action-types';
import { closeAccount, closeAccountSuccess } from 'calypso/state/account/actions';

jest.mock( 'calypso/lib/user', () => () => {
	return { clear: jest.fn() };
} );

describe( 'actions', () => {
	describe( '#closeAccount', () => {
		test( 'should return an action when an account is closed', () => {
			const action = closeAccount();
			expect( action ).toEqual( {
				type: ACCOUNT_CLOSE,
			} );
		} );
	} );

	describe( '#closeAccountSuccess', () => {
		test( 'should dispatch an action when an account is closed successfully', async () => {
			const spy = jest.fn();
			await closeAccountSuccess()( spy );
			expect( spy ).toHaveBeenCalledWith( {
				type: ACCOUNT_CLOSE_SUCCESS,
			} );
		} );
	} );
} );
