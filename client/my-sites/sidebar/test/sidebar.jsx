/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import EmptyComponent from 'test/helpers/react/empty-component';

describe( 'MySitesSidebar', () => {
	let MySitesSidebar;
	useMockery( ( mockery ) => {
		mockery.registerMock( 'lib/abtest', {
			abtest: () => ''
		} );
		mockery.registerMock( 'page', function() {} );
		mockery.registerMock( 'lib/analytics', {} );
		mockery.registerMock( 'lib/products-values', {} );
		mockery.registerMock( 'my-sites/current-site', EmptyComponent );
		mockery.registerMock( './publish-menu', EmptyComponent );
		mockery.registerMock( 'layout/sidebar', EmptyComponent );
		mockery.registerMock( 'components/tooltip', EmptyComponent );

		MySitesSidebar = require( '../sidebar' ).MySitesSidebar;
	} );

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
