/**
 * External dependencies
 */
import { assert } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getAccountRecoveryResetPickedMethod } from '../';

describe( 'getAccountRecoveryResetPickedMethod()', () => {
	it( 'should return the method field under the account recovery state tree.', () => {
		const method = 'primary_email';
		const state = deepFreeze( {
			accountRecovery: {
				reset: {
					method,
				},
			},
		} );

		assert.equal( getAccountRecoveryResetPickedMethod( state ), method );
	} );
} );
