/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isPremium } from '../util';

describe( 'utils', () => {
	describe( '#isPremium()', () => {
		it( 'given no theme object, should return false', () => {
			const premium = isPremium();
			expect( premium ).to.be.false;
		} );

		it( 'given a theme object with no stylesheet attr, should return false', () => {
			const premium = isPremium( {
				id: 'twentysixteen'
			} );
			expect( premium ).to.be.false;
		} );

		it( 'given a theme object with a stylesheet attr that doesn\'t start with "premium/", should return false', () => {
			const premium = isPremium( {
				id: 'twentysixteen',
				stylesheet: 'pub/twentysixteen'
			} );
			expect( premium ).to.be.false;
		} );

		it( 'given a theme object with a stylesheet attr that starts with "premium/", should return true', () => {
			const premium = isPremium( {
				id: 'mood',
				stylesheet: 'premium/mood'
			} );
			expect( premium ).to.be.true;
		} );
	} );
} );
