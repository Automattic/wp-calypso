/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getAccountRecoveryResetSelectedMethod } from '../';

describe( 'getAccountRecoveryResetSelectedMethod()', () => {
	test( 'should return the method field under the account recovery state tree.', () => {
		const method = 'primary_email';
		const state = deepFreeze( {
			accountRecovery: {
				reset: {
					method,
				},
			},
		} );

		expect( getAccountRecoveryResetSelectedMethod( state ) ).toEqual( method );
	} );
} );
