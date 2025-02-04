import getMagicLoginRequestAuthError from 'calypso/state/selectors/get-magic-login-request-auth-error';

describe( 'getMagicLoginRequestAuthError()', () => {
	test( 'should return null if there is no information yet', () => {
		const error = getMagicLoginRequestAuthError( undefined );
		expect( error ).toBeNull();
	} );

	test( 'should return the error if set', () => {
		const requestAuthError = { code: 403, type: 'foo_bar' };
		const error = getMagicLoginRequestAuthError( {
			login: {
				magicLogin: {
					requestAuthError,
				},
			},
		} );
		expect( error ).toEqual( requestAuthError );
	} );
} );
