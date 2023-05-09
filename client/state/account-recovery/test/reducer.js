import {
	ACCOUNT_RECOVERY_SETTINGS_FETCH,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
} from 'calypso/state/action-types';
import reducer from '../reducer';

describe( '#account-recovery/isFetchingSettings reducer :', () => {
	test( 'should set isFetchingSettings flag.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_FETCH,
		} );

		expect( state.isFetchingSettings ).toBe( true );
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

		expect( state.isFetchingSettings ).toBe( false );
	} );

	test( 'should unset isFetchingSettings flag on failure.', () => {
		const state = reducer( undefined, {
			type: ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
		} );

		expect( state.isFetchingSettings ).toBe( false );
	} );
} );
