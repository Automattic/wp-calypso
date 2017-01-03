/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import {
	isAccountRecoverySettingsReady,
	isAccountRecoveryEmailValidated,
	isAccountRecoveryPhoneValidated,
	isUpdatingAccountRecoveryPhone,
	isUpdatingAccountRecoveryEmail,
	isDeletingAccountRecoveryPhone,
	isDeletingAccountRecoveryEmail,
	isAccountRecoveryEmailActionInProgress,
	isAccountRecoveryPhoneActionInProgress,

	getAccountRecoveryEmail,
	getAccountRecoveryPhone,
} from '../selectors';

import {
	dummyNewPhone,
	dummyNewEmail,
} from './test-data';

describe( '#account-recovery/settings/selectors', () => {
	const stateBeforeFetching = {
		accountRecovery: {
			settings: {
				data: {
					email: '',
					emailValidated: false,
					phone: null,
					phoneValidated: false,
				},
				isReady: false,
			},
		},
	};

	const stateAfterFetching = {
		accountRecovery: {
			settings: {
				data: {
					email: dummyNewEmail,
					emailValidated: true,
					phone: {
						countryCode: dummyNewPhone.country_code,
						countryNumericCode: dummyNewPhone.country_numeric_code,
						number: dummyNewPhone.number,
						numberFull: dummyNewPhone.number_full,
					},
					phoneValidated: true,
				},
				isReady: true,
			},
		},
	};

	describe( '#isAccountRecoverySettingsReady', () => {
		it( 'should return false on absence', () => {
			assert.isFalse( isAccountRecoverySettingsReady( stateBeforeFetching ) );
		} );

		it( 'should return true if exists', () => {
			assert.isTrue( isAccountRecoverySettingsReady( stateAfterFetching ) );
		} );
	} );

	describe( '#isAccountRecoveryEmailValidated:', () => {
		it( 'should return false on absence', () => {
			assert.isFalse( isAccountRecoveryEmailValidated( stateBeforeFetching ) );
		} );

		it( 'should return the emailValidated field', () => {
			assert.isTrue( isAccountRecoveryEmailValidated( stateAfterFetching ) );
		} );
	} );

	describe( '#isAccountRecoveryPhoneValidated:', () => {
		it( 'should return false on absence', () => {
			assert.isFalse( isAccountRecoveryPhoneValidated( stateBeforeFetching ) );
		} );

		it( 'should return the phoneValidated field', () => {
			assert.isTrue( isAccountRecoveryPhoneValidated( stateAfterFetching ) );
		} );
	} );

	describe( '#getAccountRecoveryEmail:', () => {
		it( 'should return a default value on absence', () => {
			assert.equal( getAccountRecoveryEmail( stateBeforeFetching ), '' );
		} );

		it( 'should return the email field', () => {
			assert.equal( getAccountRecoveryEmail( stateAfterFetching ), dummyNewEmail );
		} );
	} );

	describe( '#getAccountRecoveryPhone', () => {
		it( 'should return a default value on absence', () => {
			assert.isNull( getAccountRecoveryPhone( stateBeforeFetching ) );
		} );

		it( 'should return the phone field', () => {
			assert.deepEqual( getAccountRecoveryPhone( stateAfterFetching ), {
				countryCode: dummyNewPhone.country_code,
				countryNumericCode: dummyNewPhone.country_numeric_code,
				number: dummyNewPhone.number,
				numberFull: dummyNewPhone.number_full,
			} );
		} );
	} );

	const stateBeforeUpdating = {
		accountRecovery: {
			settings: {
				isUpdating: {},
			},
		},
	};

	const stateDuringUpdating = {
		accountRecovery: {
			settings: {
				isUpdating: {
					phone: true,
					email: true,
				},
			},
		},
	};

	describe( '#isUpdatingAccountRecoveryPhone', () => {
		it( 'should return false on absence', () => {
			assert.isFalse( isUpdatingAccountRecoveryPhone( stateBeforeUpdating ) );
		} );

		it( 'should return isUpdating.phone', () => {
			assert.isTrue( isUpdatingAccountRecoveryPhone( stateDuringUpdating ) );
		} );
	} );

	describe( '#isUpdatingAccountRecoveryEmail', () => {
		it( 'should return false on absence', () => {
			assert.isFalse( isUpdatingAccountRecoveryEmail( stateBeforeUpdating ) );
		} );

		it( 'should return isUpdating.email', () => {
			assert.isTrue( isUpdatingAccountRecoveryEmail( stateDuringUpdating ) );
		} );
	} );

	const stateBeforeDeleting = {
		accountRecovery: {
			settings: {
				isDeleting: {},
			},
		},
	};

	const stateDuringDeleting = {
		accountRecovery: {
			settings: {
				isDeleting: {
					phone: true,
					email: true,
				},
			},
		},
	};

	describe( '#isDeletingAccountRecoveryPhone', () => {
		it( 'should return false on absence', () => {
			assert.isFalse( isDeletingAccountRecoveryPhone( stateBeforeDeleting ) );
		} );

		it( 'should return isDeleting.phone', () => {
			assert.isTrue( isDeletingAccountRecoveryPhone( stateDuringDeleting ) );
		} );
	} );

	describe( '#isDeletingAccountRecoveryEmail', () => {
		it( 'should return false on absence', () => {
			assert.isFalse( isDeletingAccountRecoveryEmail( stateBeforeDeleting ) );
		} );

		it( 'should return isDeleting.email', () => {
			assert.isTrue( isDeletingAccountRecoveryEmail( stateDuringDeleting ) );
		} );
	} );

	describe( '#isAccountRecoveryEmailActionInProgress', () => {
		it( 'should return true if the whole data is not in place yet', () => {
			assert.isTrue( isAccountRecoveryEmailActionInProgress( stateBeforeFetching ) );
		} );

		it( 'should return true if isUpdating.email is set', () => {
			assert.isTrue( isAccountRecoveryEmailActionInProgress( stateDuringUpdating ) );
		} );

		it( 'should return true if isDeleting.email is set', () => {
			assert.isTrue( isAccountRecoveryEmailActionInProgress( stateDuringDeleting ) );
		} );
	} );

	describe( '#isAccountRecoveryPhoneActionInProgress', () => {
		it( 'should return true if the whole data is not in place yet', () => {
			assert.isTrue( isAccountRecoveryPhoneActionInProgress( stateBeforeFetching ) );
		} );

		it( 'should return true if isUpdating.email is set', () => {
			assert.isTrue( isAccountRecoveryPhoneActionInProgress( stateDuringUpdating ) );
		} );

		it( 'should return true if isDeleting.email is set', () => {
			assert.isTrue( isAccountRecoveryPhoneActionInProgress( stateDuringDeleting ) );
		} );
	} );
} );
