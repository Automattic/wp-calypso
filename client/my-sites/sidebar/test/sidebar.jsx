/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { MySitesSidebar } from '../sidebar';

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );
jest.mock( 'lib/analytics', () => ( {} ) );
jest.mock( 'my-sites/current-site', () => require( 'components/empty-component' ) );
jest.mock( 'my-sites/sidebar/manage-menu', () => require( 'components/empty-component' ) );

describe( 'MySitesSidebar', () => {
	describe( '#isItemLinkSelected()', () => {
		test( 'should return false if none of the paths are a prefix', () => {
			const instance = new MySitesSidebar();
			const isSelected = instance.isItemLinkSelected.call(
				{
					props: {
						path: '/posts/example.wordpress.com',
					},
				},
				[ '/types/jetpack-testimonial' ]
			);

			expect( isSelected ).to.be.false;
		} );

		test( 'should return false if one of the paths is a prefix, but not at end or separated by slash', () => {
			const instance = new MySitesSidebar();
			const isSelected = instance.isItemLinkSelected.call(
				{
					props: {
						path: '/types/jetpack-testimonial-jk',
					},
				},
				[ '/types/jetpack-testimonial' ]
			);

			expect( isSelected ).to.be.false;
		} );

		test( 'should return true if one of the paths is a prefix of the current path and separated by slash', () => {
			const instance = new MySitesSidebar();
			const isSelected = instance.isItemLinkSelected.call(
				{
					props: {
						path: '/types/jetpack-testimonial/example.wordpress.com',
					},
				},
				[ '/types/jetpack-testimonial' ]
			);

			expect( isSelected ).to.be.true;
		} );

		test( 'should return true if one of the paths is a prefix of the current path and at end', () => {
			const instance = new MySitesSidebar();
			const isSelected = instance.isItemLinkSelected.call(
				{
					props: {
						path: '/types/jetpack-testimonial',
					},
				},
				[ '/types/jetpack-testimonial' ]
			);

			expect( isSelected ).to.be.true;
		} );

		test( 'should accept a path string', () => {
			const instance = new MySitesSidebar();
			const isSelected = instance.isItemLinkSelected.call(
				{
					props: {
						path: '/types/jetpack-testimonial',
					},
				},
				'/types/jetpack-testimonial'
			);

			expect( isSelected ).to.be.true;
		} );

		test( 'should return true if one of the paths is a prefix of the current path and separated by search query', () => {
			const instance = new MySitesSidebar();
			const isSelected = instance.isItemLinkSelected.call(
				{
					props: {
						path: '/posts?s=search',
					},
				},
				[ '/posts' ]
			);

			expect( isSelected ).to.be.true;
		} );
	} );
} );
