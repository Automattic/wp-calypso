/**
 * External dependencies
 */
import { assert } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getAccountRecoveryResetRequestError } from '../';

describe( 'getAccountRecoveryResetRequestError()', () => {
	it( 'should return the error field in the request-reset substate treee.', () => {
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

		assert.deepEqual( getAccountRecoveryResetRequestError( state ), error );
	} );

	it( 'should return null when there is no error stored in the request-reset substate tree.', () => {
		const state = deepFreeze( {
			accountRecovery: {
				reset: {
					requestReset: {}
				},
			},
		} );

		assert.isNull( getAccountRecoveryResetRequestError( state ) );
	} );
} );
