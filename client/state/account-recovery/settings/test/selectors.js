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
			expect( isAccountRecoverySettingsReady( stateBeforeFetching ) ).toBe( false );
		} );

		test( 'should return true if exists', () => {
			expect( isAccountRecoverySettingsReady( stateAfterFetching ) ).toBe( true );
		} );
	} );

	describe( '#isAccountRecoveryEmailValidated:', () => {
		test( 'should return false on absence', () => {
			expect( isAccountRecoveryEmailValidated( stateBeforeFetching ) ).toBe( false );
		} );

		test( 'should return the emailValidated field', () => {
			expect( isAccountRecoveryEmailValidated( stateAfterFetching ) ).toBe( true );
		} );
	} );

	describe( '#isAccountRecoveryPhoneValidated:', () => {
		test( 'should return false on absence', () => {
			expect( isAccountRecoveryPhoneValidated( stateBeforeFetching ) ).toBe( false );
		} );

		test( 'should return the phoneValidated field', () => {
			expect( isAccountRecoveryPhoneValidated( stateAfterFetching ) ).toBe( true );
		} );
	} );

	describe( '#getAccountRecoveryEmail:', () => {
		test( 'should return a default value on absence', () => {
			expect( getAccountRecoveryEmail( stateBeforeFetching ) ).toEqual( '' );
		} );

		test( 'should return the email field', () => {
			expect( getAccountRecoveryEmail( stateAfterFetching ) ).toEqual( dummyNewEmail );
		} );
	} );

	describe( '#getAccountRecoveryPhone', () => {
		test( 'should return a default value on absence', () => {
			expect( getAccountRecoveryPhone( stateBeforeFetching ) ).toBeNull();
		} );

		test( 'should return the phone field', () => {
			expect( getAccountRecoveryPhone( stateAfterFetching ) ).toEqual( {
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
			expect( isUpdatingAccountRecoveryPhone( stateBeforeUpdating ) ).toBe( false );
		} );

		test( 'should return isUpdating.phone', () => {
			expect( isUpdatingAccountRecoveryPhone( stateDuringUpdating ) ).toBe( true );
		} );
	} );

	describe( '#isUpdatingAccountRecoveryEmail', () => {
		test( 'should return false on absence', () => {
			expect( isUpdatingAccountRecoveryEmail( stateBeforeUpdating ) ).toBe( false );
		} );

		test( 'should return isUpdating.email', () => {
			expect( isUpdatingAccountRecoveryEmail( stateDuringUpdating ) ).toBe( true );
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
			expect( isDeletingAccountRecoveryPhone( stateBeforeDeleting ) ).toBe( false );
		} );

		test( 'should return isDeleting.phone', () => {
			expect( isDeletingAccountRecoveryPhone( stateDuringDeleting ) ).toBe( true );
		} );
	} );

	describe( '#isDeletingAccountRecoveryEmail', () => {
		test( 'should return false on absence', () => {
			expect( isDeletingAccountRecoveryEmail( stateBeforeDeleting ) ).toBe( false );
		} );

		test( 'should return isDeleting.email', () => {
			expect( isDeletingAccountRecoveryEmail( stateDuringDeleting ) ).toBe( true );
		} );
	} );

	describe( '#isAccountRecoveryEmailActionInProgress', () => {
		test( 'should return true if the whole data is not in place yet', () => {
			expect( isAccountRecoveryEmailActionInProgress( stateBeforeFetching ) ).toBe( true );
		} );

		test( 'should return true if isUpdating.email is set', () => {
			expect( isAccountRecoveryEmailActionInProgress( stateDuringUpdating ) ).toBe( true );
		} );

		test( 'should return true if isDeleting.email is set', () => {
			expect( isAccountRecoveryEmailActionInProgress( stateDuringDeleting ) ).toBe( true );
		} );
	} );

	describe( '#isAccountRecoveryPhoneActionInProgress', () => {
		test( 'should return true if the whole data is not in place yet', () => {
			expect( isAccountRecoveryPhoneActionInProgress( stateBeforeFetching ) ).toBe( true );
		} );

		test( 'should return true if isUpdating.email is set', () => {
			expect( isAccountRecoveryPhoneActionInProgress( stateDuringUpdating ) ).toBe( true );
		} );

		test( 'should return true if isDeleting.email is set', () => {
			expect( isAccountRecoveryPhoneActionInProgress( stateDuringDeleting ) ).toBe( true );
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

			expect( hasSentAccountRecoveryEmailValidation( state ) ).toBe( false );
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

			expect( hasSentAccountRecoveryEmailValidation( state ) ).toBe( true );
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

			expect( hasSentAccountRecoveryPhoneValidation( state ) ).toBe( false );
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

			expect( hasSentAccountRecoveryPhoneValidation( state ) ).toBe( true );
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

			expect( isValidatingAccountRecoveryPhone( state ) ).toBe( true );
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

			expect( shouldPromptAccountRecoveryEmailValidationNotice( state ) ).toBe( true );
		} );

		test( 'should not prompt if the settings data is not ready.', () => {
			expect( shouldPromptAccountRecoveryEmailValidationNotice( stateBeforeFetching ) ).toBe(
				false
			);
		} );

		test( 'should not prompt if isUpdating.email is set.', () => {
			expect( shouldPromptAccountRecoveryEmailValidationNotice( stateDuringUpdating ) ).toBe(
				false
			);
		} );

		test( 'should not prompt if isDeleting.email is set.', () => {
			expect( shouldPromptAccountRecoveryEmailValidationNotice( stateDuringDeleting ) ).toBe(
				false
			);
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

			expect( shouldPromptAccountRecoveryPhoneValidationNotice( state ) ).toBe( true );
		} );

		test( 'should not prompt if the settings data is not ready.', () => {
			expect( shouldPromptAccountRecoveryPhoneValidationNotice( stateBeforeFetching ) ).toBe(
				false
			);
		} );

		test( 'should not prompt if isUpdating.phone is set.', () => {
			expect( shouldPromptAccountRecoveryPhoneValidationNotice( stateDuringUpdating ) ).toBe(
				false
			);
		} );

		test( 'should not prompt if isDeleting.phone is set.', () => {
			expect( shouldPromptAccountRecoveryPhoneValidationNotice( stateDuringDeleting ) ).toBe(
				false
			);
		} );
	} );
} );
