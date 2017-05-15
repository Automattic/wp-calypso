/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getMagicLoginRequestedEmailSuccessfully } from '../';

describe( 'getMagicLoginRequestedEmailSuccessfully()', () => {
	it( 'should return false if there is no information yet', () => {
		const requested = getMagicLoginRequestedEmailSuccessfully( undefined );
		expect( requested ).to.be.false;
	} );

	it( 'should return true if true', () => {
		const requested = getMagicLoginRequestedEmailSuccessfully( {
			login: {
				magicLogin: {
					requestedEmailSuccessfully: true,
				},
			},
		} );
		expect( requested ).to.be.true;
	} );

	it( 'should return false if false', () => {
		const requested = getMagicLoginRequestedEmailSuccessfully( {
			login: {
				magicLogin: {
					requestedEmailSuccessfully: false,
				},
			},
		} );
		expect( requested ).to.be.false;
	} );
} );
