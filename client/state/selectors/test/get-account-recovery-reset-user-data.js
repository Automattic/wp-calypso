/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { getAccountRecoveryResetUserData } from '../';

describe( 'getAccountRecoveryResetUserData()', () => {
	it( 'should return the userData substate tree.', () => {
		const expectedUserData = {
			user: 'userlogin',
			firstName: 'Foo',
			lastName: 'Bar',
			url: 'site.example.com',
		};
		const state = {
			accountRecovery: {
				reset: {
					userData: expectedUserData,
				},
			},
		};

		assert.deepEqual( getAccountRecoveryResetUserData( state ), expectedUserData );
	} );
} );
