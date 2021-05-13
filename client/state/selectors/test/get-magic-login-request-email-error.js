/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getMagicLoginRequestEmailError from 'calypso/state/selectors/get-magic-login-request-email-error';

describe( 'getMagicLoginRequestEmailError()', () => {
	test( 'should return null if there is no information yet', () => {
		const error = getMagicLoginRequestEmailError( undefined );
		expect( error ).to.be.null;
	} );

	test( 'should return the error if set', () => {
		const error = getMagicLoginRequestEmailError( {
			login: {
				magicLogin: {
					requestEmailError: 'to err is human',
				},
			},
		} );
		expect( error ).to.equal( 'to err is human' );
	} );
} );
