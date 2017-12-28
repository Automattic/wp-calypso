/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getMagicLoginRequestAuthError } from 'client/state/selectors';

describe( 'getMagicLoginRequestAuthError()', () => {
	test( 'should return null if there is no information yet', () => {
		const error = getMagicLoginRequestAuthError( undefined );
		expect( error ).to.be.null;
	} );

	test( 'should return the error if set', () => {
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
