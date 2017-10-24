/** @format */

/**
 * External dependencies
 */
import { getAccountRecoveryResetOptionsError } from '../';

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

		expect( getAccountRecoveryResetOptionsError( state ) ).toEqual( expectedError );
	} );

	test( 'should return null if no error exists.', () => {
		const state = {
			accountRecovery: {
				reset: {
					options: {},
				},
			},
		};

		expect( getAccountRecoveryResetOptionsError( state ) ).toBeNull();
	} );
} );
