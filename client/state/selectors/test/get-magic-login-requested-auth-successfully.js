/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getMagicLoginRequestedAuthSuccessfully } from '../';

describe( 'getMagicLoginRequestedAuthSuccessfully()', () => {
	it( 'should return false if there is no information yet', () => {
		const status = getMagicLoginRequestedAuthSuccessfully( undefined );
		expect( status ).to.be.false;
	} );

	it( 'should return true if requested auth succeeded', () => {
		const status = getMagicLoginRequestedAuthSuccessfully( {
			login: {
				magicLogin: {
					requestAuthSuccess: true,
				},
			},
		} );
		expect( status ).to.be.true;
	} );

	it( 'should return false if requested auth failed', () => {
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
