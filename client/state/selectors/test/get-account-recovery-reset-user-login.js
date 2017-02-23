/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { getAccountRecoveryResetUserLogin } from '../';

describe( 'getAccountRecoveryResetUserLogin', () => {
	it( 'should return the user field under the account recovery state tree', () => {
		const testUser = 'foouser';
		const state = {
			accountRecovery: {
				reset: {
					userData: {
						user: testUser,
					},
				},
			},
		};

		assert.equal( getAccountRecoveryResetUserLogin( state ), testUser );
	} );
} );
