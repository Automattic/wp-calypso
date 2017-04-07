/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getMagicLoginRequestAuthStatus } from '../';

describe( 'getMagicLoginRequestAuthStatus()', () => {
	it( 'should return null if there is no information yet', () => {
		const status = getMagicLoginRequestAuthStatus( undefined );
		expect( status ).to.be.null;
	} );

	it( 'should return the status if set', () => {
		const status = getMagicLoginRequestAuthStatus( {
			login: {
				magicLogin: {
					requestAuthSuccess: 'ice cold',
				},
			},
		} );
		expect( status ).to.equal( 'ice cold' );
	} );
} );
