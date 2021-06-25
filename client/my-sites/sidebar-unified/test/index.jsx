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
		test( "should return false if a path's first fragment doesn't match the current path", () => {
			const isSelected = itemLinkMatches(
				'/pages/example.wordpress.com',
				'/posts/example.wordpress.com'
			);

			expect( isSelected ).to.be.false;
		} );

		test( "should return true if a path's first fragment does match the current path", () => {
			const isSelected = itemLinkMatches(
				'/pages/example.wordpress.com',
				'/pages/test/example.wordpress.com'
			);

			expect( isSelected ).to.be.true;
		} );

		test( 'should return true for jetpack types', () => {
			const isSelected = itemLinkMatches(
				'/types/jetpack-testimonial',
				'/types/jetpack-testimonial/test'
			);

			expect( isSelected ).to.be.true;
		} );

		test( 'should return true if one of the paths is a prefix of the current path and separated by search query', () => {
			const isSelected = itemLinkMatches( '/posts', '/posts?s=search' );

			expect( isSelected ).to.be.true;
		} );

		test( 'should return false if a fragment matches but not in position (1)', () => {
			const isSelected = itemLinkMatches(
				'/pages/example.wordpress.com',
				'/test/pages/example.wordpress.com'
			);

			expect( isSelected ).to.be.false;
		} );
		test( '#itemLinkMatches() compares 2 part path with 1 part path without error', () => {
			const isSelected = itemLinkMatches( '/stats/day', '/plugins' );

			expect( isSelected ).to.be.false;
		} );
	} );

	describe( '#itemLinkMatches() edge cases', () => {
		test( 'clicking a settings panel should not activate the posts menu', () => {
			const isSelected = itemLinkMatches(
				'/settings/taxonomies/category/example.wordpress.com',
				'/settings/discussion/cpapfree.wordpress.com'
			);

			expect( isSelected ).to.be.false;
		} );

		test( 'clicking a marketing panel should activate the marketing/tools menu', () => {
			const isSelected = itemLinkMatches(
				'/marketing/tools/example.wordpress.com',
				'/marketing/traffic/cpapfree.wordpress.com'
			);

			expect( isSelected ).to.be.true;
		} );
	} );
} );
