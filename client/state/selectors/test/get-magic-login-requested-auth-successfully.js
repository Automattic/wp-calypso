/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getMagicLoginRequestedAuthSuccessfully from 'calypso/state/selectors/get-magic-login-requested-auth-successfully';

describe( 'getMagicLoginRequestedAuthSuccessfully()', () => {
	test( 'should return false if there is no information yet', () => {
		const status = getMagicLoginRequestedAuthSuccessfully( undefined );
		expect( status ).to.be.false;
	} );

	test( 'should return true if requested auth succeeded', () => {
		const status = getMagicLoginRequestedAuthSuccessfully( {
			login: {
				magicLogin: {
					requestAuthSuccess: true,
				},
			},
		} );
		expect( status ).to.be.true;
	} );

	test( 'should return false if requested auth failed', () => {
		const status = getMagicLoginRequestedAuthSuccessfully( {
			login: {
				magicLogin: {
					requestAuthSuccess: false,
				},
			},
		} );
		expect( status ).to.be.false;
	} );
} );
