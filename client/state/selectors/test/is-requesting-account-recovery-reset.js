/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { isRequestingAccountRecoveryReset } from '../';

describe( 'isRequestingAccountRecoveryReset()', () => {
	test( 'should return the requesting status flag under the request-reset state tree.', () => {
		const state = deepFreeze( {
			accountRecovery: {
				reset: {
					requestReset: {
						isRequesting: true,
					},
				},
			},
		} );

		expect( isRequestingAccountRecoveryReset( state ) ).toBe( true );
	} );
} );
