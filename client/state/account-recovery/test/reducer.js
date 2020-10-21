/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	ACCOUNT_RECOVERY_SETTINGS_FETCH,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
} from 'calypso/state/action-types';

describe( '#account-recovery/isFetchingSettings reducer :', () => {
	test( 'should set isFetchingSettings flag.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_FETCH,
		} );

		assert.isTrue( state.isFetchingSettings );
	} );

	test( 'should unset isFetchingSettings flag on success.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
			settings: {
				email: '',
				email_validated: true,
				phone: {},
				phone_validated: true,
			},
		} );

		assert.isFalse( state.isFetchingSettings );
	} );

	test( 'should unset isFetchingSettings flag on failure.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
		} );

		assert.isFalse( state.isFetchingSettings );
	} );
} );
