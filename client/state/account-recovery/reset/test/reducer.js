/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
} from 'state/action-types';

import reducer from '../reducer';

describe( '#account-recovery/reset reducer', () => {
	it( 'ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST action should set isRequesting flag.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST
		} );

		assert.isTrue( state.options.isRequesting );
	} );

	const requestingState = {
		options: {
			isRequesting: true,
		},
	};

	it( 'ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE action should unset isRequesting flag.', () => {
		const state = reducer( requestingState, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
		} );

		assert.isFalse( state.options.isRequesting );
	} );

	it( 'ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR action should unset isRequesting flag.', () => {
		const state = reducer( requestingState, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
		} );

		assert.isFalse( state.options.isRequesting );
	} );

	it( 'ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE action should populate the items field.', () => {
		const fetchedOptions = [
			{
				email: 'primary@example.com',
				sms: '123456789',
			},
			{
				email: 'secondary@example.com',
				sms: '123456789',
			},
		];
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
			items: fetchedOptions,
		} );

		assert.deepEqual( state.options.items, fetchedOptions );
	} );

	it( 'ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR action should populate the error field.', () => {
		const fetchError = {
			status: 400,
			message: 'Something wrong!',
		};

		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
			error: fetchError,
		} );

		assert.deepEqual( state.options.error, fetchError );
	} );
} );
