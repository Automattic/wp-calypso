/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import {
	ACCOUNT_RECOVERY_SETTINGS_FETCH,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
} from 'state/action-types';

import reducer from '../reducer';

describe( '#account-recovery/isFetchingSettings reducer :', () => {
	it( 'should set isFetchingSettings flag.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_FETCH,
		} );

		assert.isTrue( state.isFetchingSettings );
	} );

	it( 'should unset isFetchingSettings flag on success.', () => {
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

	it( 'should unset isFetchingSettings flag on failure.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
		} );

		assert.isFalse( state.isFetchingSettings );
	} );
} );
