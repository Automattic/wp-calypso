/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getAccountRecoveryResetRequestError } from '../';

describe( 'getAccountRecoveryResetRequestError()', () => {
	test( 'should return the error field in the request-reset substate treee.', () => {
		const error = {
			status: 404,
			message: 'Fake error.',
		};
		const state = deepFreeze( {
			accountRecovery: {
				reset: {
					requestReset: {
						error,
					},
				},
			},
		} );

		expect( getAccountRecoveryResetRequestError( state ) ).toEqual( error );
	} );

	test( 'should return null when there is no error stored in the request-reset substate tree.', () => {
		const state = deepFreeze( {
			accountRecovery: {
				reset: {
					requestReset: {},
				},
			},
		} );

		expect( getAccountRecoveryResetRequestError( state ) ).toBeNull();
	} );
} );
