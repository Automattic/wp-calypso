import { closeAccount, closeAccountSuccess } from 'calypso/state/account/actions';
import { ACCOUNT_CLOSE, ACCOUNT_CLOSE_SUCCESS } from 'calypso/state/action-types';

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
		test( 'should dispatch an action when an account is closed successfully', () => {
			expect( closeAccountSuccess() ).toEqual( {
				type: ACCOUNT_CLOSE_SUCCESS,
			} );
		} );
	} );
} );
