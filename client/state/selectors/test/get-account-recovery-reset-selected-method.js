/** @format */

/**
 * External dependencies
 */
import { assert } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getAccountRecoveryResetSelectedMethod } from 'state/selectors';

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

		assert.equal( getAccountRecoveryResetSelectedMethod( state ), method );
	} );
} );
