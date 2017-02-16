/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import {
	fetchResetOptionsSuccess,
	fetchResetOptionsError,
} from '../actions';

import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
} from 'state/action-types';

describe( '#fetchResetOptionsSuccess', () => {
	it( 'should return ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE action with options field.', () => {
		const options = {
			primaryEmail: 'primary@example.com',
			primarySms: '12345678',
			secondaryEmail: 'secondary@example.com',
			secondarySms: '12345678',
		};

		const action = fetchResetOptionsSuccess( options );

		assert.deepEqual( action, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
			options,
		} );
	} );
} );

describe( '#fetchResetOptionsError', () => {
	it( 'should return ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR action with error field.', () => {
		const error = {
			status: 400,
			message: 'error!',
		};

		const action = fetchResetOptionsError( error );

		assert.deepEqual( action, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
			error,
		} );
	} );
} );
