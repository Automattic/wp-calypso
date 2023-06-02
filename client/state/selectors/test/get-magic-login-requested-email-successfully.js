import getMagicLoginRequestedEmailSuccessfully from 'calypso/state/selectors/get-magic-login-requested-email-successfully';

describe( 'getMagicLoginRequestedEmailSuccessfully()', () => {
	test( 'should return false if there is no information yet', () => {
		const requested = getMagicLoginRequestedEmailSuccessfully( undefined );
		expect( requested ).toBe( false );
	} );

	test( 'should return true if true', () => {
		const requested = getMagicLoginRequestedEmailSuccessfully( {
			login: {
				magicLogin: {
					requestedEmailSuccessfully: true,
				},
			},
		} );
		expect( requested ).toBe( true );
	} );

	test( 'should return false if false', () => {
		const requested = getMagicLoginRequestedEmailSuccessfully( {
			login: {
				magicLogin: {
					requestedEmailSuccessfully: false,
				},
			},
		} );
		expect( requested ).toBe( false );
	} );
} );
