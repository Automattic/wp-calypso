/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { getAccountRecoveryResetUserLastName } from '../';

describe( 'getAccountRecoveryResetUserLastName', () => {
	it( 'should return the lastName field under the account recovery state tree', () => {
		const expectedLastName = 'Bar';
		const state = {
			accountRecovery: {
				reset: {
					userData: {
						lastName: expectedLastName,
					},
				},
			},
		};

		assert.equal( getAccountRecoveryResetUserLastName( state ), expectedLastName );
	} );
} );
