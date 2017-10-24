/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getAccountRecoveryResetUserData } from '../';

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

		expect( getAccountRecoveryResetUserData( state ) ).toEqual( expectedUserData );
	} );
} );
