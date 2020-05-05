/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { productCategoryUpdated } from '../actions';
import {
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_FAILURE,
} from 'woocommerce/state/action-types';
import { isQueryLoading, isQueryError, items, queries, total, totalPages } from '../reducer';
import reducer from 'woocommerce/state/sites/reducer';

const cats = [
	{
		id: 10,
		name: 'Tops',
		slug: 'tops',
		description: '',
		display: 'default',
	},
];

const anotherCat = {
	id: 11,
	name: 'Test',
	slug: 'test',
	description: '',
	display: 'default',
};

describe( 'reducer', () => {
	describe( 'isQueryLoading', () => {
		test( 'should have no change by default', () => {
			const newState = isQueryLoading( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should store the currently loading page', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
				siteId: 123,
				query: {
					page: 1,
				},
			};
			const newState = isQueryLoading( undefined, action );
			expect( newState ).to.eql( { '{}': true } );
		} );

		test( 'should show that request has loaded on success', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
				siteId: 123,
				query: {
					page: 1,
				},
				total: 2,
				totalPages: 1,
				data: [],
			};
			const newState = isQueryLoading( { '{}': true }, action );
			expect( newState ).to.eql( { '{}': false } );
		} );

		test( 'should show that request has loaded on failure', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_FAILURE,
				siteId: 123,
				error: 'test',
				query: {},
			};
			const newState = isQueryLoading( { '{}': true }, action );
			expect( newState ).to.eql( { '{}': false } );
		} );

		test( 'should not update state for another site ID', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
				siteId: 546,
				query: {
					page: 1,
				},
				total: 2,
				totalPages: 1,
				data: cats,
			};

			const newState = reducer(
				{
					546: {
						productCategories: {
							isQueryLoading: {
								'{}': true,
							},
						},
					},
					123: {
						productCategories: {
							isQueryLoading: {
								'{}': true,
							},
						},
					},
				},
				action
			);
			expect( newState[ 546 ].productCategories.isQueryLoading ).to.eql( { '{}': false } );
			expect( newState[ 123 ].productCategories.isQueryLoading ).to.eql( { '{}': true } );
		} );
	} );

	describe( 'isQueryError', () => {
		test( 'should have no change by default', () => {
			const newState = isQueryError( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should do nothing on success', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
				siteId: 123,
				query: {
					page: 1,
				},
				total: 2,
				totalPages: 1,
				dat: cats,
			};
			const newState = isQueryError( undefined, action );
			expect( newState ).to.eql( {} );
		} );

		test( 'should show that request has errored on failure', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_FAILURE,
				siteId: 123,
				query: {
					page: 1,
				},
				error: 'error',
			};
			const newState = isQueryError( undefined, action );
			expect( newState ).to.eql( { '{}': true } );
		} );
	} );

	describe( 'items', () => {
		test( 'should have no change by default', () => {
			const newState = items( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should store the categories in state', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
				siteId: 123,
				query: {
					page: 1,
				},
				total: 3,
				totalPages: 1,
				data: cats,
			};
			const newState = items( undefined, action );
			const catsById = keyBy( cats, 'id' );
			expect( newState ).to.eql( catsById );
		} );

		test( 'should add additional categories onto the existing category list', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
				siteId: 123,
				query: {
					page: 2,
				},
				total: 2,
				totalPages: 2,
				data: [ anotherCat ],
			};
			const originalState = deepFreeze( keyBy( cats, 'id' ) );
			const newState = items( originalState, action );
			expect( newState ).to.eql( { ...originalState, 11: anotherCat } );
		} );

		test( 'should do nothing on a failure', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_FAILURE,
				siteId: 123,
				query: {
					page: 1,
				},
				error: '',
			};
			const originalState = deepFreeze( keyBy( cats, 'id' ) );
			const newState = items( originalState, action );
			expect( newState ).to.eql( originalState );
		} );

		test( 'should store data from an updated action', () => {
			const siteId = 123;
			const category1 = { id: 11, name: 'Cat Updated', slug: 'cat-updated' };
			const action = productCategoryUpdated( siteId, category1 );
			const originalState = deepFreeze( keyBy( cats, 'id' ) );
			const newState = items( originalState, action );
			expect( originalState[ 10 ].name ).to.eql( 'Tops' );
			expect( newState[ 10 ].name ).to.eql( 'Tops' );
			expect( newState[ 11 ].name ).to.eql( 'Cat Updated' );
		} );

		test( 'remove data after a deleted action', () => {
			const testCats = [
				{
					id: 10,
					name: 'Tops',
					slug: 'tops',
					description: '',
					display: 'default',
				},
				{
					id: 11,
					name: 'Test',
					slug: 'test',
					description: '',
					display: 'default',
				},
			];

			const siteId = 123;
			const category = { id: 10, name: 'Tops' };
			const action = {
				type: 'WOOCOMMERCE_PRODUCT_CATEGORY_DELETED',
				siteId,
				category,
			};
			const originalState = deepFreeze( keyBy( testCats, 'id' ) );
			const newState = items( originalState, action );
			expect( originalState[ 10 ].name ).to.eql( 'Tops' );
			expect( newState[ 10 ] ).to.not.exist;
			expect( newState[ 11 ].name ).to.eql( 'Test' );
		} );
	} );

	describe( 'queries', () => {
		test( 'should have no change by default', () => {
			const newState = queries( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should store the IDs for the requested query', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
				siteId: 123,
				query: {
					page: 1,
				},
				total: 1,
				totalPages: 1,
				data: cats,
			};
			const newState = queries( undefined, action );
			expect( newState ).to.eql( { '{}': [ 10 ] } );
		} );

		test( 'should add the next page of categories as a second list', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
				siteId: 123,
				query: {
					page: 2,
				},
				total: 2,
				totalPages: 2,
				data: [ anotherCat ],
			};
			const originalState = deepFreeze( { '{}': [ 10 ] } );
			const newState = queries( originalState, action );
			expect( newState ).to.eql( { ...originalState, '{"page":2}': [ 11 ] } );
		} );

		test( 'should do nothing on a failure', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_FAILURE,
				siteId: 123,
				query: {
					page: 1,
				},
				error: '',
			};
			const originalState = deepFreeze( { '{}': [ 10 ] } );
			const newState = queries( originalState, action );
			expect( newState ).to.eql( originalState );
		} );
	} );
	describe( 'total', () => {
		test( 'should have no change by default', () => {
			const newState = total( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should store the total number of categories when a request loads', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
				siteId: 123,
				query: {
					page: 1,
				},
				total: 2,
				totalPages: 1,
				data: cats,
			};
			const newState = total( undefined, action );
			expect( newState ).to.eql( { '{}': 2 } );
		} );

		test( 'should do nothing on a failure', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_FAILURE,
				siteId: 123,
				query: {
					page: 1,
				},
				error: '',
			};
			const originalState = deepFreeze( { '{}': 2 } );
			const newState = total( originalState, action );
			expect( newState ).to.eql( originalState );
		} );
	} );
	describe( 'totalPages', () => {
		test( 'should have no change by default', () => {
			const newState = totalPages( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should store the total number of pages when a request loads', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
				siteId: 123,
				query: {
					page: 1,
				},
				total: 2,
				totalPages: 1,
				data: cats,
			};
			const newState = totalPages( undefined, action );
			expect( newState ).to.eql( { '{}': 1 } );
		} );

		test( 'should do nothing on a failure', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_FAILURE,
				siteId: 123,
				query: {
					page: 1,
				},
				error: '',
			};
			const originalState = deepFreeze( { '{}': 2 } );
			const newState = totalPages( originalState, action );
			expect( newState ).to.eql( originalState );
		} );
	} );
} );
