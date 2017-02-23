/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { getAccountRecoveryResetUserFirstName } from '../';

describe( 'getAccountRecoveryResetUserFirstName', () => {
	it( 'should return the firstName field under the account recovery state tree', () => {
		const expectedFirstName = 'Foo';
		const state = {
			accountRecovery: {
				reset: {
					userData: {
						firstName: expectedFirstName,
					},
				},
			},
		};

		assert.equal( getAccountRecoveryResetUserFirstName( state ), expectedFirstName );
	} );
} );
