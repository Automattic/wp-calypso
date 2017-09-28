jest.mock( 'lib/abtest', () => ( {
	abtest: () => ''
} ) );
jest.mock( 'lib/analytics', () => ( {} ) );
jest.mock( 'my-sites/current-site', () => require( 'components/empty-component' ) );
jest.mock( 'my-sites/sidebar/manage-menu', () => require( 'components/empty-component' ) );

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { MySitesSidebar } from '../sidebar';

describe( 'MySitesSidebar', () => {
	describe( '#isItemLinkSelected()', () => {
		it( 'should return false if none of the paths are a prefix', () => {
			const instance = new MySitesSidebar();
			const isSelected = instance.isItemLinkSelected.call( {
				props: {
					path: '/posts/example.wordpress.com'
				}
			}, [ '/types/jetpack-testimonial' ] );

			expect( isSelected ).to.be.false;
		} );

		it( 'should return false if one of the paths is a prefix, but not at end or separated by slash', () => {
			const instance = new MySitesSidebar();
			const isSelected = instance.isItemLinkSelected.call( {
				props: {
					path: '/types/jetpack-testimonial-jk'
				}
			}, [ '/types/jetpack-testimonial' ] );

			expect( isSelected ).to.be.false;
		} );

		it( 'should return true if one of the paths is a prefix of the current path and separated by slash', () => {
			const instance = new MySitesSidebar();
			const isSelected = instance.isItemLinkSelected.call( {
				props: {
					path: '/types/jetpack-testimonial/example.wordpress.com'
				}
			}, [ '/types/jetpack-testimonial' ] );

			expect( isSelected ).to.be.true;
		} );

		it( 'should return true if one of the paths is a prefix of the current path and at end', () => {
			const instance = new MySitesSidebar();
			const isSelected = instance.isItemLinkSelected.call( {
				props: {
					path: '/types/jetpack-testimonial'
				}
			}, [ '/types/jetpack-testimonial' ] );

			expect( isSelected ).to.be.true;
		} );

		it( 'should accept a path string', () => {
			const instance = new MySitesSidebar();
			const isSelected = instance.isItemLinkSelected.call( {
				props: {
					path: '/types/jetpack-testimonial'
				}
			}, '/types/jetpack-testimonial' );

			expect( isSelected ).to.be.true;
		} );
	} );
} );
