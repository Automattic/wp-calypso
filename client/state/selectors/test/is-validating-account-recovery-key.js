/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { isValidatingAccountRecoveryKey } from '../';

describe( 'isValidatingAccountRecoveryKey()', () => {
	test( 'should return the requesting field under the validate substate tree.', () => {
		const state = deepFreeze( {
			accountRecovery: {
				reset: {
					validate: {
						isRequesting: true,
					},
				},
			},
		} );

		expect( isValidatingAccountRecoveryKey( state ) ).toBe( true );
	} );

	test( 'should return false as the default value.', () => {
		expect( isValidatingAccountRecoveryKey( undefined ) ).toBe( false );
	} );
} );
