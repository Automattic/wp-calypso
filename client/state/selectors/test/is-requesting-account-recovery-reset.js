/**
 * External dependencies
 */
import { assert } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { isRequestingAccountRecoveryReset } from '../';

describe( 'isRequestingAccountRecoveryReset()', () => {
	it( 'should return the requesting status flag under the request-reset state tree.', () => {
		const state = deepFreeze( {
			accountRecovery: {
				reset: {
					requestReset: {
						isRequesting: true,
					},
				},
			},
		} );

		assert.isTrue( isRequestingAccountRecoveryReset( state ) );
	} );
} );
