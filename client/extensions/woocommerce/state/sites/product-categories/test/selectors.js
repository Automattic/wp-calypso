/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getProductCategories, getProductCategory } from '../selectors';
import { LOADING } from 'woocommerce/state/constants';

describe( 'selectors', () => {
	describe( '#getProductCategories()', () => {
		it( 'should return an empty array if data is not available.', () => {
			const state = {
				extensions: {
					woocommerce: {},
				},
			};

			expect( getProductCategories( state, 123 ) ).to.eql( [] );
		} );

		it( 'should return an empty array if data is still loading.', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								productCategories: LOADING,
							},
						},
					},
				},
			};

			expect( getProductCategories( state, 123 ) ).to.eql( [] );
		} );

		it( 'should give product categories from specified site', () => {
			const categories123 = [
				{ id: 1, name: 'cat1', slug: 'cat-1' },
				{ id: 2, name: 'cat2', slug: 'cat-2' },
			];

			const categories345 = [
				{ id: 3, name: 'cat3', slug: 'cat-3' },
				{ id: 4, name: 'cat4', slug: 'cat-4' },
			];

			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								productCategories: categories123,
							},
							345: {
								productCategories: categories345,
							},
						},
					},
				},
			};

			expect( getProductCategories( state, 123 ) ).to.equal( categories123 );
			expect( getProductCategories( state, 345 ) ).to.equal( categories345 );
		} );
	} );

	describe( '#getProductCategory', () => {
		it( 'should return undefined if data is not available.', () => {
			const state = {
				extensions: {
					woocommerce: {},
				},
			};

			expect( getProductCategory( state, 1, 123 ) ).to.not.exist;
		} );

		it( 'should return undefined if data is still loading.', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								productCategories: LOADING,
							},
						},
					},
				},
			};

			expect( getProductCategory( state, 1, 123 ) ).to.not.exist;
		} );

		it( 'should return null if category is not found', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								productCategories: [ { id: 1, name: 'Cat 1', slug: 'cat-1' } ],
							},
						},
					},
				},
			};

			expect( getProductCategory( state, 2, 123 ) ).to.equal( null );
			expect( getProductCategory( state, { index: 0 }, 123 ) ).to.equal( null );
		} );

		it( 'should return categories that exist in fetched state', () => {
			const categories123 = [
				{ id: 1, name: 'Cat 1', slug: 'cat-1' },
				{ id: 2, name: 'Cat 2', slug: 'cat-2' },
			];

			const categories345 = [
				{ id: 3, name: 'Cat 3', slug: 'cat-3' },
				{ id: 4, name: 'Cat 4', slug: 'cat-4' },
			];

			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								productCategories: categories123,
							},
							345: {
								productCategories: categories345,
							},
						},
					},
				},
			};

			expect( getProductCategory( state, 1, 123 ) ).to.equal( categories123[ 0 ] );
			expect( getProductCategory( state, 2, 123 ) ).to.equal( categories123[ 1 ] );
			expect( getProductCategory( state, 3, 345 ) ).to.equal( categories345[ 0 ] );
			expect( getProductCategory( state, 4, 345 ) ).to.equal( categories345[ 1 ] );
		} );
	} );
} );
