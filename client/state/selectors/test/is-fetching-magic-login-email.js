import isFetchingMagicLoginEmail from 'calypso/state/selectors/is-fetching-magic-login-email';

describe( 'isFetchingMagicLoginEmail()', () => {
	test( 'should return false if there is no fetching information yet', () => {
		const isFetching = isFetchingMagicLoginEmail( undefined );
		expect( isFetching ).toBe( false );
	} );

	test( 'should return true if client is requesting an email', () => {
		const isFetching = isFetchingMagicLoginEmail( {
			login: {
				magicLogin: {
					isFetchingEmail: true,
				},
			},
		} );
		expect( isFetching ).toBe( true );
	} );

	test( 'should return false when finished requesting an email', () => {
		const isFetching = isFetchingMagicLoginEmail( {
			login: {
				magicLogin: {
					isFetchingEmail: false,
				},
			},
		} );
		expect( isFetching ).toBe( false );
	} );
} );
