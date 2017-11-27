/** @format */

/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { getAccountRecoveryResetOptionsError } from 'state/selectors';

describe( 'getAccountRecoveryResetOptionsError()', () => {
	test( 'should return the error under account recovery state tree.', () => {
		const expectedError = {
			status: 404,
			message: 'Something wrong!',
		};
		const state = {
			accountRecovery: {
				reset: {
					options: {
						error: expectedError,
					},
				},
			},
		};

		assert.deepEqual( getAccountRecoveryResetOptionsError( state ), expectedError );
	} );

	test( 'should return null if no error exists.', () => {
		const state = {
			accountRecovery: {
				reset: {
					options: {},
				},
			},
		};

		assert.isNull( getAccountRecoveryResetOptionsError( state ) );
	} );
} );
