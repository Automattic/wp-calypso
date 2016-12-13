/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import {
	isAccountRecoveryEmailValidated,
	isAccountRecoveryPhoneValidated,
	getAccountRecoveryEmail,
	getAccountRecoveryPhoneCountryCode,
	getAccountRecoveryPhoneCountryNumericCode,
	getAccountRecoveryPhoneNumber,
	getAccountRecoveryPhoneNumberFull,
	isUpdatingAccountRecoveryPhone,
	isUpdatingAccountRecoveryEmail,
	isDeletingAccountRecoveryPhone,
	isDeletingAccountRecoveryEmail,
} from '../selectors';

import {
	dummyNewPhone,
	dummyNewEmail,
} from './test-data';

describe( '#account-recovery/settings/selectors', () => {
	const stateBeforeFetching = {
		accountRecovery: {
			settings: {
				data: null,
			},
		},
	};

	const stateAfterFetching = {
		accountRecovery: {
			settings: {
				data: {
					email: dummyNewEmail,
					emailValidated: true,
					phoneCountryCode: dummyNewPhone.country_code,
					phoneCountryNumericCode: dummyNewPhone.country_numeric_code,
					phoneNumber: dummyNewPhone.number,
					phoneNumberFull: dummyNewPhone.number_full,
					phoneValidated: true,
				},
			},
		},
	};

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

	describe( '#getAccountRecoveryPhoneCountryCode', () => {
		it( 'should return a default value on absence', () => {
			assert.equal( getAccountRecoveryPhoneCountryCode( stateBeforeFetching ), '' );
		} );

		it( 'should return the phoneCountryCode field', () => {
			assert.equal( getAccountRecoveryPhoneCountryCode( stateAfterFetching ), dummyNewPhone.country_code );
		} );
	} );

	describe( '#getAccountRecoveryPhoneCountryNumericCode', () => {
		it( 'should return a default value on absence', () => {
			assert.equal( getAccountRecoveryPhoneCountryNumericCode( stateBeforeFetching ), '' );
		} );

		it( 'should return the phoneCountryNumericCode field', () => {
			assert.equal( getAccountRecoveryPhoneCountryNumericCode( stateAfterFetching ), dummyNewPhone.country_numeric_code );
		} );
	} );

	describe( '#getAccountRecoveryPhoneNumber', () => {
		it( 'should return a default value on absence', () => {
			assert.equal( getAccountRecoveryPhoneNumber( stateBeforeFetching ), '' );
		} );

		it( 'should return the phoneNumber field', () => {
			assert.equal( getAccountRecoveryPhoneNumber( stateAfterFetching ), dummyNewPhone.number );
		} );
	} );

	describe( '#getAccountRecoveryPhoneNumberFull', () => {
		it( 'should return a default value on absence', () => {
			assert.equal( getAccountRecoveryPhoneNumberFull( stateBeforeFetching ), '' );
		} );

		it( 'should return the phoneNumberFull field', () => {
			assert.equal( getAccountRecoveryPhoneNumberFull( stateAfterFetching ), dummyNewPhone.number_full );
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
} );
