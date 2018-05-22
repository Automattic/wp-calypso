/** @format */

/**
 * Internal dependencies
 */
import { ACCOUNT_CLOSE } from 'state/action-types';
import { closeAccount } from 'state/account/actions';

describe( 'actions', () => {
	describe( '#closeAccount', () => {
		test( 'should return an action when an account is closed', () => {
			const action = closeAccount();
			expect( action ).toEqual( {
				type: ACCOUNT_CLOSE,
			} );
		} );
	} );
} );
