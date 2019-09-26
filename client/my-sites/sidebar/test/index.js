/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { itemLinkMatches } from '../utils';

describe( 'MySitesSidebar', () => {
	describe( '#itemLinkMatches()', () => {
		test( 'should return false if none of the paths are a prefix', () => {
			const isSelected = itemLinkMatches(
				[ '/types/jetpack-testimonial' ],
				'/posts/example.wordpress.com'
			);

			expect( isSelected ).to.be.false;
		} );

		test( 'should return false if one of the paths is a prefix, but not at end or separated by slash', () => {
			const isSelected = itemLinkMatches(
				[ '/types/jetpack-testimonial' ],
				'/types/jetpack-testimonial-jk'
			);

			expect( isSelected ).to.be.false;
		} );

		test( 'should return true if one of the paths is a prefix of the current path and at end', () => {
			const isSelected = itemLinkMatches(
				[ '/types/jetpack-testimonial' ],
				'/types/jetpack-testimonial'
			);

			expect( isSelected ).to.be.true;
		} );

		test( 'should return true if one of the paths is a prefix of the current path and separated by slash', () => {
			const isSelected = itemLinkMatches(
				[ '/types/jetpack-testimonial' ],
				'/types/jetpack-testimonial/example.wordpress.com'
			);

			expect( isSelected ).to.be.true;
		} );

		test( 'should return true if one of the paths is a prefix of the current path and separated by search query', () => {
			const isSelected = itemLinkMatches( [ '/posts' ], '/posts?s=search' );

			expect( isSelected ).to.be.true;
		} );
	} );
} );
