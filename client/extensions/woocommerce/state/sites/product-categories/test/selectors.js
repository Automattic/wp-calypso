/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getProductCategories,
	getProductCategory,
	areProductCategoriesLoaded,
	areProductCategoriesLoading,
	getTotalProductCategories,
} from '../selectors';

const preInitializedState = {
	extensions: {
		woocommerce: {},
	},
};

const loadingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					productCategories: {
						isQueryLoading: {
							'{}': true,
						},
					},
				},
			},
		},
	},
};

const loadedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					productCategories: {
						items: {
							1: { id: 1, name: 'cat1', slug: 'cat-1' },
							2: { id: 2, name: 'cat2', slug: 'cat-2' },
						},
						queries: {
							'{}': [ 1, 2 ],
						},
						total: {
							'{}': 2,
						},
					},
				},
				345: {
					productCategories: {
						items: {
							3: { id: 3, name: 'cat3', slug: 'cat-3' },
							4: { id: 4, name: 'cat4', slug: 'cat-4' },
						},
						queries: {
							'{}': [ 3, 4 ],
						},
						total: {
							'{}': 2,
						},
					},
				},
			},
		},
	},
};

const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#getProductCategories()', () => {
		test( 'should return an empty array if data is not available.', () => {
			expect( getProductCategories( preInitializedState, {}, 123 ) ).to.eql( [] );
		} );

		test( 'should return an empty array if data is still loading.', () => {
			expect( getProductCategories( loadingState, {}, 123 ) ).to.eql( [] );
		} );

		test( 'should give product categories from specified site', () => {
			expect( getProductCategories( loadedState, {}, 123 ) ).to.eql( [
				{ id: 1, name: 'cat1', slug: 'cat-1' },
				{ id: 2, name: 'cat2', slug: 'cat-2' },
			] );
			expect( getProductCategories( loadedState, {}, 345 ) ).to.eql( [
				{ id: 3, name: 'cat3', slug: 'cat-3' },
				{ id: 4, name: 'cat4', slug: 'cat-4' },
			] );
		} );
	} );

	describe( '#getProductCategory', () => {
		test( 'should return undefined if data is not available.', () => {
			expect( getProductCategory( preInitializedState, 1, 123 ) ).to.not.exist;
		} );

		test( 'should return undefined if data is still loading.', () => {
			expect( getProductCategory( loadingState, 1, 123 ) ).to.not.exist;
		} );

		test( 'should return null if category is not found', () => {
			expect( getProductCategory( loadedState, 3, 123 ) ).to.equal( null );
			expect( getProductCategory( loadedState, { index: 0 }, 123 ) ).to.equal( null );
		} );

		test( 'should return categories that exist in fetched state', () => {
			const categories123 = [
				{ id: 1, name: 'cat1', slug: 'cat-1' },
				{ id: 2, name: 'cat2', slug: 'cat-2' },
			];
			const categories345 = [
				{ id: 3, name: 'cat3', slug: 'cat-3' },
				{ id: 4, name: 'cat4', slug: 'cat-4' },
			];

			expect( getProductCategory( loadedState, 1, 123 ) ).to.eql( categories123[ 0 ] );
			expect( getProductCategory( loadedState, 2, 123 ) ).to.eql( categories123[ 1 ] );
			expect( getProductCategory( loadedState, 3, 345 ) ).to.eql( categories345[ 0 ] );
			expect( getProductCategory( loadedState, 4, 345 ) ).to.eql( categories345[ 1 ] );
		} );
	} );
	describe( '#areProductCategoriesLoaded', () => {
		test( 'should be false when state is not available.', () => {
			expect( areProductCategoriesLoaded( preInitializedState, {}, 123 ) ).to.be.false;
		} );

		test( 'should be false when categories are currently being fetched.', () => {
			expect( areProductCategoriesLoaded( loadingState, {}, 123 ) ).to.be.false;
		} );

		test( 'should be true when categories are loaded.', () => {
			expect( areProductCategoriesLoaded( loadedState, {}, 123 ) ).to.be.true;
		} );

		test( 'should be false when categories are loaded only for a different site.', () => {
			expect( areProductCategoriesLoaded( loadedState, {}, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areProductCategoriesLoaded( loadedStateWithUi, {} ) ).to.be.true;
		} );
	} );

	describe( '#areProductCategoriesLoading', () => {
		test( 'should be false when state is not available.', () => {
			expect( areProductCategoriesLoading( preInitializedState, {}, 123 ) ).to.be.false;
		} );

		test( 'should be true when categories are currently being fetched.', () => {
			expect( areProductCategoriesLoading( loadingState, {}, 123 ) ).to.be.true;
		} );

		test( 'should be false when categories are loaded.', () => {
			expect( areProductCategoriesLoading( loadedState, {}, 123 ) ).to.be.false;
		} );

		test( 'should be false when categories are loaded only for a different site.', () => {
			expect( areProductCategoriesLoading( loadedState, {}, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areProductCategoriesLoading( loadedStateWithUi, {} ) ).to.be.false;
		} );
	} );

	describe( '#getTotalProductCategories', () => {
		test( 'should be 0 (default) when woocommerce state is not available.', () => {
			expect( getTotalProductCategories( preInitializedState, {}, 123 ) ).to.eql( 0 );
		} );

		test( 'should be 0 (default) when categories are loading.', () => {
			expect( getTotalProductCategories( loadingState, {}, 123 ) ).to.eql( 0 );
		} );

		test( 'should be 2, the set total, if the categories are loaded.', () => {
			expect( getTotalProductCategories( loadedState, {}, 123 ) ).to.eql( 2 );
		} );

		test( 'should be 0 (default) when categories are loaded only for a different site.', () => {
			expect( getTotalProductCategories( loadedState, {}, 456 ) ).to.eql( 0 );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getTotalProductCategories( loadedStateWithUi ) ).to.eql( 2 );
		} );
	} );
} );
