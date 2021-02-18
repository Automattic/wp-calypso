/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	areProductCategoriesLoaded,
	areProductCategoriesLoading,
	areAnyProductCategoriesLoading,
	getProductCategory,
	getProductCategories,
	getAllProductCategories,
	getAllProductCategoriesBySearch,
	getProductCategoriesLastPage,
	getTotalProductCategories,
} from '../selectors';
import woocommerce from './fixtures/categories';
const state = deepFreeze( { extensions: { woocommerce } } );

/*
 * state.extensions.woocommerce.sites has five sites:
 *  - site.one: nothing loaded yet
 *  - site.two: 1 page of categories loaded, 1 still loadingState
 *  - site.three: 2 pages of categories loaded
 *  - site.four: first page of categories is loading
 *  - site.five: all results for a given search are loaded
 */

describe( 'selectors', () => {
	describe( '#areProductCategoriesLoaded', () => {
		test( 'should be false when state is not available.', () => {
			expect( areProductCategoriesLoaded( state, {}, 'site.one' ) ).to.be.false;
		} );

		test( 'should be false when categories are currently being fetched.', () => {
			expect( areProductCategoriesLoaded( state, { page: 2 }, 'site.two' ) ).to.be.false;
		} );

		test( 'should be true when categories are loaded.', () => {
			expect( areProductCategoriesLoaded( state, {}, 'site.two' ) ).to.be.true;
		} );
	} );

	describe( '#areProductCategoriesLoading', () => {
		test( 'should be false when state is not available.', () => {
			expect( areProductCategoriesLoading( state, {}, 'site.one' ) ).to.be.false;
		} );

		test( 'should be true when categories are currently being fetched.', () => {
			expect( areProductCategoriesLoading( state, { page: 2 }, 'site.two' ) ).to.be.true;
		} );

		test( 'should be false when categories are loaded.', () => {
			expect( areProductCategoriesLoading( state, {}, 'site.three' ) ).to.be.false;
		} );
	} );

	describe( '#areAnyProductCategoriesLoading', () => {
		test( 'should be false when state is not available.', () => {
			expect( areAnyProductCategoriesLoading( state, 'site.one' ) ).to.be.false;
		} );

		test( 'should be true when any page of categories are currently being fetched.', () => {
			// page 2 is currently being fetched, but this selector ignores page
			expect( areAnyProductCategoriesLoading( state, 'site.two' ) ).to.be.true;
		} );

		test( 'should be false when categories are loaded.', () => {
			expect( areAnyProductCategoriesLoading( state, 'site.three' ) ).to.be.false;
		} );
	} );

	describe( '#getProductCategory', () => {
		test( 'should return undefined if data is not available.', () => {
			expect( getProductCategory( state, 1, 'site.one' ) ).to.not.exist;
		} );

		test( 'should return undefined if data is still loading.', () => {
			expect( getProductCategory( state, 3, 'site.two' ) ).to.not.exist;
		} );

		test( 'should return null if category is not found', () => {
			expect( getProductCategory( state, 10, 'site.three' ) ).to.equal( null );
			expect( getProductCategory( state, { index: 0 }, 'site.three' ) ).to.equal( null );
		} );

		test( 'should return categories that exist in fetched state', () => {
			const categories = [
				{ id: 1, label: 'cat1', name: 'cat1', slug: 'cat-1', parent: 0 },
				{ id: 2, label: 'cat2', name: 'cat2', slug: 'cat-2', parent: 0 },
			];

			expect( getProductCategory( state, 1, 'site.three' ) ).to.eql( categories[ 0 ] );
			expect( getProductCategory( state, 2, 'site.three' ) ).to.eql( categories[ 1 ] );
		} );
	} );

	describe( '#getProductCategories()', () => {
		test( 'should return an empty array if data is not available.', () => {
			expect( getProductCategories( state, {}, 'site.one' ) ).to.eql( [] );
		} );

		test( 'should return an empty array if data is still loading.', () => {
			expect( getProductCategories( state, { page: 2 }, 'site.two' ) ).to.eql( [] );
		} );

		test( 'should give product categories from specified site', () => {
			expect( getProductCategories( state, {}, 'site.three' ) ).to.have.lengthOf( 5 );
			expect( getProductCategories( state, { page: 2 }, 'site.three' ) ).to.eql( [
				{ id: 6, label: 'cat6', name: 'cat6', slug: 'cat-6', parent: 0 },
			] );
		} );
	} );

	describe( '#getAllProductCategories()', () => {
		test( 'should return an empty array if data is not available.', () => {
			expect( getAllProductCategories( state, 'site.one' ) ).to.eql( [] );
		} );

		test( 'should return the existing categories as an array if more data is loading.', () => {
			expect( getAllProductCategories( state, 'site.two' ) ).to.eql( [
				{ id: 1, label: 'cat1', name: 'cat1', slug: 'cat-1', parent: 0 },
				{ id: 2, label: 'cat2', name: 'cat2', slug: 'cat-2', parent: 0 },
			] );
		} );

		test( 'should get all product categories from specified site', () => {
			expect( getAllProductCategories( state, 'site.three' ) ).to.have.lengthOf( 6 );
			expect( getAllProductCategories( state, 'site.three' ) ).to.eql( [
				{ id: 1, label: 'cat1', name: 'cat1', slug: 'cat-1', parent: 0 },
				{ id: 2, label: 'cat2', name: 'cat2', slug: 'cat-2', parent: 0 },
				{ id: 3, label: 'cat2 - cat3', name: 'cat3', slug: 'cat-3', parent: 2 },
				{ id: 4, label: 'cat2 - cat3 - cat4', name: 'cat4', slug: 'cat-4', parent: 3 },
				{ id: 5, label: 'cat5', name: 'cat5', slug: 'cat-5', parent: 0 },
				{ id: 6, label: 'cat6', name: 'cat6', slug: 'cat-6', parent: 0 },
			] );
		} );
	} );

	describe( '#getAllProductCategoriesBySearch()', () => {
		test( 'should return an empty array if no search queries are loaded.', () => {
			expect( getAllProductCategoriesBySearch( state, 'test', 'site.one' ) ).to.eql( [] );
		} );

		test( 'should return the existing categories as an array if more data is loading.', () => {
			expect( getAllProductCategoriesBySearch( state, 'test', 'site.six' ) ).to.eql( [
				{ id: 1, label: 'cat1', name: 'cat1', slug: 'cat-1', parent: 0 },
				{ id: 2, label: 'cat2', name: 'cat2', slug: 'cat-2', parent: 0 },
			] );
		} );

		test( 'should get all product categories from specified site', () => {
			expect( getAllProductCategoriesBySearch( state, 'test', 'site.five' ) ).to.have.lengthOf( 4 );
			expect( getAllProductCategoriesBySearch( state, 'test', 'site.five' ) ).to.eql( [
				{ id: 1, label: 'cat1', name: 'cat1', slug: 'cat-1', parent: 0 },
				{ id: 2, label: 'cat2', name: 'cat2', slug: 'cat-2', parent: 0 },
				{ id: 5, label: 'cat5', name: 'cat5', slug: 'cat-5', parent: 0 },
				{ id: 6, label: 'cat6', name: 'cat6', slug: 'cat-6', parent: 0 },
			] );
		} );
	} );

	describe( '#getProductCategoriesLastPage', () => {
		test( 'should be null (default) when woocommerce state is not available.', () => {
			expect( getProductCategoriesLastPage( state, {}, 'site.one' ) ).to.eql( null );
		} );

		test( 'should be null (default) when categories are loading.', () => {
			expect( getProductCategoriesLastPage( state, {}, 'site.four' ) ).to.eql( null );
		} );

		test( 'should be 2, the set total, if the categories are loaded.', () => {
			expect( getProductCategoriesLastPage( state, {}, 'site.three' ) ).to.eql( 2 );
		} );
	} );

	describe( '#getTotalProductCategories', () => {
		test( 'should be 0 (default) when woocommerce state is not available.', () => {
			expect( getTotalProductCategories( state, {}, 'site.one' ) ).to.eql( 0 );
		} );

		test( 'should be 0 (default) when categories are loading.', () => {
			expect( getTotalProductCategories( state, {}, 'site.four' ) ).to.eql( 0 );
		} );

		test( 'should be 6, the set total, if the categories are loaded.', () => {
			expect( getTotalProductCategories( state, {}, 'site.three' ) ).to.eql( 6 );
		} );
	} );
} );
