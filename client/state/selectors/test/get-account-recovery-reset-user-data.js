/** @format */

/**
 * External dependencies
 */
import { assert } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import getAccountRecoveryResetUserData from 'state/selectors/get-account-recovery-reset-user-data';

describe( 'getAccountRecoveryResetUserData()', () => {
	test( 'should return the userData substate tree.', () => {
		const expectedUserData = {
			user: 'userlogin',
			firstName: 'Foo',
			lastName: 'Bar',
			url: 'site.example.com',
		};
		const state = deepFreeze( {
			accountRecovery: {
				reset: {
					userData: expectedUserData,
				},
			},
		} );

		assert.deepEqual( getAccountRecoveryResetUserData( state ), expectedUserData );
	} );
} );
