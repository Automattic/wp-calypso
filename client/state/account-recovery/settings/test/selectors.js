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
	isValidatingAccountRecoveryPhone,
	hasSentAccountRecoveryEmailValidation,
	hasSentAccountRecoveryPhoneValidation,
	shouldPromptAccountRecoveryEmailValidationNotice,
	shouldPromptAccountRecoveryPhoneValidationNotice,
	getAccountRecoveryEmail,
	getAccountRecoveryPhone,
} from '../selectors';
import { dummyNewPhone, dummyNewEmail } from './test-data';

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
		test( 'should return false on absence', () => {
			assert.isFalse( isAccountRecoverySettingsReady( stateBeforeFetching ) );
		} );

		test( 'should return true if exists', () => {
			assert.isTrue( isAccountRecoverySettingsReady( stateAfterFetching ) );
		} );
	} );

	describe( '#isAccountRecoveryEmailValidated:', () => {
		test( 'should return false on absence', () => {
			assert.isFalse( isAccountRecoveryEmailValidated( stateBeforeFetching ) );
		} );

		test( 'should return the emailValidated field', () => {
			assert.isTrue( isAccountRecoveryEmailValidated( stateAfterFetching ) );
		} );
	} );

	describe( '#isAccountRecoveryPhoneValidated:', () => {
		test( 'should return false on absence', () => {
			assert.isFalse( isAccountRecoveryPhoneValidated( stateBeforeFetching ) );
		} );

		test( 'should return the phoneValidated field', () => {
			assert.isTrue( isAccountRecoveryPhoneValidated( stateAfterFetching ) );
		} );
	} );

	describe( '#getAccountRecoveryEmail:', () => {
		test( 'should return a default value on absence', () => {
			assert.equal( getAccountRecoveryEmail( stateBeforeFetching ), '' );
		} );

		test( 'should return the email field', () => {
			assert.equal( getAccountRecoveryEmail( stateAfterFetching ), dummyNewEmail );
		} );
	} );

	describe( '#getAccountRecoveryPhone', () => {
		test( 'should return a default value on absence', () => {
			assert.isNull( getAccountRecoveryPhone( stateBeforeFetching ) );
		} );

		test( 'should return the phone field', () => {
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
		test( 'should return false on absence', () => {
			assert.isFalse( isUpdatingAccountRecoveryPhone( stateBeforeUpdating ) );
		} );

		test( 'should return isUpdating.phone', () => {
			assert.isTrue( isUpdatingAccountRecoveryPhone( stateDuringUpdating ) );
		} );
	} );

	describe( '#isUpdatingAccountRecoveryEmail', () => {
		test( 'should return false on absence', () => {
			assert.isFalse( isUpdatingAccountRecoveryEmail( stateBeforeUpdating ) );
		} );

		test( 'should return isUpdating.email', () => {
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
		test( 'should return false on absence', () => {
			assert.isFalse( isDeletingAccountRecoveryPhone( stateBeforeDeleting ) );
		} );

		test( 'should return isDeleting.phone', () => {
			assert.isTrue( isDeletingAccountRecoveryPhone( stateDuringDeleting ) );
		} );
	} );

	describe( '#isDeletingAccountRecoveryEmail', () => {
		test( 'should return false on absence', () => {
			assert.isFalse( isDeletingAccountRecoveryEmail( stateBeforeDeleting ) );
		} );

		test( 'should return isDeleting.email', () => {
			assert.isTrue( isDeletingAccountRecoveryEmail( stateDuringDeleting ) );
		} );
	} );

	describe( '#isAccountRecoveryEmailActionInProgress', () => {
		test( 'should return true if the whole data is not in place yet', () => {
			assert.isTrue( isAccountRecoveryEmailActionInProgress( stateBeforeFetching ) );
		} );

		test( 'should return true if isUpdating.email is set', () => {
			assert.isTrue( isAccountRecoveryEmailActionInProgress( stateDuringUpdating ) );
		} );

		test( 'should return true if isDeleting.email is set', () => {
			assert.isTrue( isAccountRecoveryEmailActionInProgress( stateDuringDeleting ) );
		} );
	} );

	describe( '#isAccountRecoveryPhoneActionInProgress', () => {
		test( 'should return true if the whole data is not in place yet', () => {
			assert.isTrue( isAccountRecoveryPhoneActionInProgress( stateBeforeFetching ) );
		} );

		test( 'should return true if isUpdating.email is set', () => {
			assert.isTrue( isAccountRecoveryPhoneActionInProgress( stateDuringUpdating ) );
		} );

		test( 'should return true if isDeleting.email is set', () => {
			assert.isTrue( isAccountRecoveryPhoneActionInProgress( stateDuringDeleting ) );
		} );
	} );

	describe( '#hasSentAccountRecoveryEmailValidation', () => {
		test( 'should return false on absence', () => {
			const state = {
				accountRecovery: {
					settings: {
						hasSentValidation: {},
					},
				},
			};

			assert.isFalse( hasSentAccountRecoveryEmailValidation( state ) );
		} );

		test( 'should return hasSentValidation.email', () => {
			const state = {
				accountRecovery: {
					settings: {
						hasSentValidation: {
							email: true,
						},
					},
				},
			};

			assert.isTrue( hasSentAccountRecoveryEmailValidation( state ) );
		} );
	} );

	describe( '#hasSentAccountRecoveryPhoneValidation', () => {
		test( 'should return false on absence', () => {
			const state = {
				accountRecovery: {
					settings: {
						hasSentValidation: {},
					},
				},
			};

			assert.isFalse( hasSentAccountRecoveryPhoneValidation( state ) );
		} );

		test( 'should return hasSentValidation.phone', () => {
			const state = {
				accountRecovery: {
					settings: {
						hasSentValidation: {
							phone: true,
						},
					},
				},
			};

			assert.isTrue( hasSentAccountRecoveryPhoneValidation( state ) );
		} );
	} );

	describe( '#isValidatingAccountRecoveryPhone', () => {
		test( 'should return isValidatingPhone', () => {
			const state = {
				accountRecovery: {
					settings: {
						isValidatingPhone: true,
					},
				},
			};

			assert.isTrue( isValidatingAccountRecoveryPhone( state ) );
		} );
	} );

	describe( '#shouldPromptAccountRecoveryEmailValidationNotice', () => {
		test( 'should prompt if the email exists and is not validated.', () => {
			const state = {
				accountRecovery: {
					settings: {
						data: {
							email: 'aaa@example.com',
							emailValidated: false,
						},
						isReady: true,
						hasSentValidation: {},
						isUpdating: {},
						isDeleting: {},
					},
				},
			};

			assert.isTrue( shouldPromptAccountRecoveryEmailValidationNotice( state ) );
		} );

		test( 'should not prompt if the settings data is not ready.', () => {
			assert.isFalse( shouldPromptAccountRecoveryEmailValidationNotice( stateBeforeFetching ) );
		} );

		test( 'should not prompt if isUpdating.email is set.', () => {
			assert.isFalse( shouldPromptAccountRecoveryEmailValidationNotice( stateDuringUpdating ) );
		} );

		test( 'should not prompt if isDeleting.email is set.', () => {
			assert.isFalse( shouldPromptAccountRecoveryEmailValidationNotice( stateDuringDeleting ) );
		} );
	} );

	describe( '#shouldPromptAccountRecoveryPhoneValidationNotice', () => {
		test( 'should prompt if the phone exists and is not validated.', () => {
			const state = {
				accountRecovery: {
					settings: {
						data: {
							phone: {
								countryCode: dummyNewPhone.country_code,
								countryNumericCode: dummyNewPhone.country_numeric_code,
								number: dummyNewPhone.number,
								numberFull: dummyNewPhone.number_full,
							},
							phoneValidated: false,
						},
						isReady: true,
						hasSentValidation: {},
						isUpdating: {},
						isDeleting: {},
					},
				},
			};

			assert.isTrue( shouldPromptAccountRecoveryPhoneValidationNotice( state ) );
		} );

		test( 'should not prompt if the settings data is not ready.', () => {
			assert.isFalse( shouldPromptAccountRecoveryPhoneValidationNotice( stateBeforeFetching ) );
		} );

		test( 'should not prompt if isUpdating.phone is set.', () => {
			assert.isFalse( shouldPromptAccountRecoveryPhoneValidationNotice( stateDuringUpdating ) );
		} );

		test( 'should not prompt if isDeleting.phone is set.', () => {
			assert.isFalse( shouldPromptAccountRecoveryPhoneValidationNotice( stateDuringDeleting ) );
		} );
	} );
} );
