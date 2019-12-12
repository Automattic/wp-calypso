/**
 * Internal dependencies
 */
import { ACCOUNT_CLOSE, ACCOUNT_CLOSE_SUCCESS } from 'state/action-types';
import { closeAccount, closeAccountSuccess } from 'state/account/actions';

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
		test( 'should return an action when an account is closed successfully', () => {
			const action = closeAccountSuccess();
			expect( action ).toEqual( {
				type: ACCOUNT_CLOSE_SUCCESS,
			} );
		} );
	} );
} );
