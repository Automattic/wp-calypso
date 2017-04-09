/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getMagicLoginRequestAuthError } from '../';

describe( 'getMagicLoginRequestAuthError()', () => {
	it( 'should return null if there is no information yet', () => {
		const error = getMagicLoginRequestAuthError( undefined );
		expect( error ).to.be.null;
	} );

	it( 'should return the error if set', () => {
		const error = getMagicLoginRequestAuthError( {
			login: {
				magicLogin: {
					requestAuthError: 'to err is human',
				},
			},
		} );
		expect( error ).to.equal( 'to err is human' );
	} );
} );
