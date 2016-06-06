/**
 * External dependencies
 */
import { assert } from 'chai';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import common from './common';
import data from './data';
import { action as ActionTypes } from '../constants';
import CategoryStoreFactory from '../category-store-factory';
import Dispatcher from 'dispatcher';

describe( 'category-store', function() {
	let defaultCategoryStore;

	beforeEach( function() {
		CategoryStoreFactory._categoryStores = {};
		defaultCategoryStore = CategoryStoreFactory( common.TEST_CATEGORY_STORE_ID );
	} );

	afterEach( function() {
		if ( defaultCategoryStore.dispatchToken ) {
			Dispatcher.unregister( defaultCategoryStore.dispatchToken );
		}
	} );

	describe( '#found', function() {
		it( 'should set found', function() {
			common.dispatchReceiveCategoryTerms();
			assert.equal( defaultCategoryStore.found( common.TEST_SITE_ID ), data.treeList.length );
		} );

		it( 'should return null when no site data exists', function() {
			assert.equal( defaultCategoryStore.found( common.TEST_SITE_ID ), null );
		} );
	} );

	describe( '#isFetchingPage', function() {
		it( 'should set isFetchingPage', function() {
			Dispatcher.handleViewAction( {
				type: 'FETCH_CATEGORIES',
				id: common.TEST_CATEGORY_STORE_ID,
				siteId: common.TEST_SITE_ID
			} );
			assert.isTrue( defaultCategoryStore.isFetchingPage( common.TEST_SITE_ID ) );
		} );

		it( 'should be false when not fetching', function() {
			common.dispatchReceiveCategoryTerms();
			assert.isFalse( defaultCategoryStore.isFetchingPage( common.TEST_SITE_ID ) );
		} );
	} );

	describe( '#hasNextPage', function() {
		it( 'should return false when no additional page exists', function() {
			common.dispatchReceiveCategoryTerms();
			assert.isFalse( defaultCategoryStore.hasNextPage( common.TEST_SITE_ID ) );
		} );

		it( 'should return true when another page exists', function() {
			common.dispatchPaginatedReceiveTerms();
			assert.isTrue( defaultCategoryStore.hasNextPage( common.TEST_SITE_ID ) );
		} );

		it( 'should not have another page when last response had no data', function() {
			common.dispatchPaginatedReceiveTerms();
			assert.isTrue( defaultCategoryStore.hasNextPage( common.TEST_SITE_ID ) );

			Dispatcher.handleServerAction( {
				type: ActionTypes.RECEIVE_TERMS,
				id: common.TEST_CATEGORY_STORE_ID,
				siteId: common.TEST_SITE_ID,
				data: {
					termType: 'categories',
					terms: [],
					found: data.treeList.length + 100
				},
				error: null
			} );
			assert.isFalse( defaultCategoryStore.hasNextPage( common.TEST_SITE_ID ) );
		} );
	} );

	describe( '#get', function() {
		it( 'should get the correct category', function() {
			var category;
			common.dispatchReceiveCategoryTerms();
			category = defaultCategoryStore.get( common.TEST_SITE_ID, common.TEST_CATEGORY_ID );
			assert.equal( category.name, 'a cat' );
		} );
	} );

	describe( '#getAllNames', function() {
		it( 'should return an empty array by default', function() {
			var categories = defaultCategoryStore.getAllNames( common.TEST_SITE_ID, common.TEST_CATEGORY_ID );
			assert.isTrue( Array.isArray( categories ) );
			assert.equal( categories.length, 0 );
		} );

		it( 'should return all category names', function() {
			var categories;
			common.dispatchReceiveCategoryTerms();
			categories = defaultCategoryStore.getAllNames( common.TEST_SITE_ID );
			assert.equal( categories.length, 9 );
			assert.equal( categories[ 0 ], 'zed cat' );
		} );
	} );

	describe( '#getChildren', function() {
		it( 'should return an empty array by default', function() {
			var categories = defaultCategoryStore.getChildren( common.TEST_SITE_ID, common.TEST_CATEGORY_ID );
			assert.isTrue( Array.isArray( categories ) );
			assert.equal( categories.length, 0 );
		} );

		it( 'should return the correct child categories', function() {
			var categories;
			common.dispatchReceiveCategoryTerms();
			categories = defaultCategoryStore.getChildren( common.TEST_SITE_ID, common.TEST_CATEGORY_ID );
			assert.equal( categories.length, 1 );
			assert.equal( categories[ 0 ].slug, 'a-cat-child-1' );
		} );

		it( 'should return top level categories when no category id supplied', function() {
			var categories;
			common.dispatchReceiveCategoryTerms();
			categories = defaultCategoryStore.getChildren( common.TEST_SITE_ID );
			assert.equal( categories.length, 8 );
		} );
	} );

	describe( '#all', function() {
		it( 'should treeify categories', function() {
			var categories;
			common.dispatchPaginatedReceiveTerms();
			categories = defaultCategoryStore.all( common.TEST_SITE_ID );
			assert.equal( categories[ 0 ].items.length, 1 );
			assert.isUndefined( categories[ 1 ].items );
		} );

		it( 'should alphabetize categories by name', function() {
			var categories, lastCategory;
			common.dispatchPaginatedReceiveTerms();
			categories = defaultCategoryStore.all( common.TEST_SITE_ID );
			lastCategory = categories[ categories.length - 1 ];
			assert.equal( lastCategory.name, 'zed cat' );
		} );

		it( 'should return the correct number of categories', function() {
			var categories;
			common.dispatchReceiveCategoryTerms();
			categories = defaultCategoryStore.all( common.TEST_SITE_ID );
			assert.equal( categories.length, common.TEST_NUM_CATEGORIES );
		} );

		it( 'should add temporary categories', function() {
			var categories;
			common.dispatchReceiveAddTempTerm();
			categories = defaultCategoryStore.all( common.TEST_SITE_ID );
			assert.equal( categories.length, 1 );
		} );

		it( 'should remove temporary category when old ID present', function() {
			var categories;

			common.dispatchReceiveAddTempTerm();
			categories = defaultCategoryStore.all( common.TEST_SITE_ID );
			assert.equal( categories.length, 1 );
			assert.equal( categories[ 0 ].ID, common.TEMPORARY_ID );

			Dispatcher.handleServerAction( {
				type: ActionTypes.RECEIVE_TERMS,
				id: common.TEST_CATEGORY_STORE_ID,
				siteId: common.TEST_SITE_ID,
				data: {
					termType: 'categories',
					terms: [ {
						ID: 787,
						name: 'Another Test',
						temporaryId: common.TEMPORARY_ID
					} ]
				},
				error: null
			} );

			categories = defaultCategoryStore.all( common.TEST_SITE_ID );
			assert.equal( categories.length, 1 );
			assert.equal( categories[ 0 ].ID, 787 );
		} );
	} );

	describe( '#getQueryParams', function() {
		it( 'should return the correct default query params', function() {
			var params = defaultCategoryStore.getQueryParams( common.TEST_SITE_ID );
			assert.equal( params.number, 300 );
			assert.equal( params.page, 1 );
		} );

		it( 'should have correct query params after RECEIVE_TERMS', function() {
			var params, otherCategoryStore;

			otherCategoryStore = CategoryStoreFactory( 'parent' );
			common.dispatchPaginatedReceiveTerms( 'parent' );

			params = otherCategoryStore.getQueryParams( common.TEST_SITE_ID );
			assert.equal( params.number, 300 );
			assert.equal( params.page, 2 );
		} );

		it( 'should respect query params set via action', function() {
			var params;
			common.dispatchSetQuery();
			params = defaultCategoryStore.getQueryParams( common.TEST_SITE_ID );
			assert.equal( params.number, 300 );
			assert.equal( params.search, common.TEST_QUERY.search );
		} );

		it( 'should preserve query options across pages', function() {
			var params, otherCategoryStore;

			otherCategoryStore = CategoryStoreFactory( 'yet-another-category-store' );
			common.dispatchSetQuery( {}, 'yet-another-category-store' );
			common.dispatchPaginatedReceiveTerms( 'yet-another-category-store' );

			params = otherCategoryStore.getQueryParams( common.TEST_SITE_ID );
			assert.equal( params.number, 300 );
			assert.equal( params.page, 2 );
			assert.equal( params.search, common.TEST_QUERY.search );
		} );

		it( 'should not allow page to be set as a query option', function() {
			var params;
			common.dispatchSetQuery( { page: 99 } );
			params = defaultCategoryStore.getQueryParams( common.TEST_SITE_ID );
			assert.equal( params.page, 1 );
		} );

		it( 'should not clear in memory store for same query set', function() {
			common.dispatchSetQuery();
			common.dispatchReceiveCategoryTerms();

			assert.equal( defaultCategoryStore.all( common.TEST_SITE_ID ).length, common.TEST_NUM_CATEGORIES );
			common.dispatchSetQuery();
			assert.equal( defaultCategoryStore.all( common.TEST_SITE_ID ).length, common.TEST_NUM_CATEGORIES );
		} );

		it( 'should clear in memory store for different query set', function() {
			common.dispatchSetQuery();
			common.dispatchReceiveCategoryTerms();

			assert.equal( defaultCategoryStore.all( common.TEST_SITE_ID ).length, common.TEST_NUM_CATEGORIES );
			common.dispatchSetQuery( { search: 'muchwow' } );
			assert.isUndefined( defaultCategoryStore.all( common.TEST_SITE_ID ) );
		} );
	} );

	describe( 'adding category', function() {
		it( 'should add a new category', function() {
			var categories;
			common.dispatchAddTerm();

			categories = defaultCategoryStore.all( common.TEST_SITE_ID );
			assert.equal( defaultCategoryStore.all( common.TEST_SITE_ID ).length, 1 );
			assert.equal( categories[ 0 ].ID, common.TEST_ADDED_TERM.ID );
			assert.equal( categories[ 0 ].name, common.TEST_ADDED_TERM.name );
		} );

		it( 'should increment found', function() {
			var found;
			common.dispatchReceiveCategoryTerms();
			found = defaultCategoryStore.found( common.TEST_SITE_ID );
			common.dispatchAddTerm();
			assert.equal( defaultCategoryStore.found( common.TEST_SITE_ID ), found + 1 );
		} );

		it( 'should add a new category regardless of categoryStoreId', function() {
			var categories, categoryIds;
			common.dispatchReceiveCategoryTerms();
			assert.equal( defaultCategoryStore.all( common.TEST_SITE_ID ).length, common.TEST_NUM_CATEGORIES );

			common.dispatchAddTerm( 'some_other_category_store_id' );

			categories = defaultCategoryStore.all( common.TEST_SITE_ID );
			assert.equal( defaultCategoryStore.all( common.TEST_SITE_ID ).length, common.TEST_NUM_CATEGORIES + 1 );

			categoryIds = categories.map( function( category ) {
				return category.ID;
			} );
			assert.isTrue( includes( categoryIds, common.TEST_ADDED_TERM.ID ) );
		} );
	} );

	describe( 'dispatcher', function() {
		it( 'should have a dispatch token', function() {
			assert.typeOf( defaultCategoryStore.dispatchToken, 'string' );
		} );

		it( 'should ignore tag payloads', function() {
			common.dispatchReceiveTagTerms();
			assert.isUndefined( defaultCategoryStore.all( common.TEST_SITE_ID ) );
		} );
	} );
} );
