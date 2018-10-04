/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import {
	handleProductCategoryCreate,
	handleProductCategoryDelete,
	handleProductCategoryDeleteSuccess,
	handleProductCategoryUpdate,
	fetch,
	onFetchSuccess,
	onFetchError,
} from '../';
import {
	WOOCOMMERCE_API_REQUEST,
	WOOCOMMERCE_PRODUCT_CATEGORY_DELETE,
	WOOCOMMERCE_PRODUCT_CATEGORY_DELETED,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_FAILURE,
} from 'woocommerce/state/action-types';
import {
	createProductCategory,
	updateProductCategory,
	deleteProductCategory,
} from 'woocommerce/state/sites/product-categories/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'handlers', () => {
	describe( '#fetch()', () => {
		test( 'should dispatch a get action', () => {
			const siteId = '123';
			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
				siteId,
				query: {},
			};
			const result = fetch( action );
			expect( result ).to.eql(
				http(
					{
						method: 'GET',
						path: '/jetpack-blogs/123/rest-api/',
						apiVersion: '1.1',
						body: null,
						query: {
							json: true,
							path: '/wc/v3/products/categories&page=1&per_page=100&_envelope&_method=GET',
						},
					},
					action
				)
			);
		} );
	} );

	describe( '#onFetchSuccess()', () => {
		test( 'should dispatch a success action with product category information when request completes', () => {
			const siteId = '123';
			const dispatch = spy();

			const cats = [
				{
					id: 10,
					name: 'Tops',
					slug: 'tops',
					description: '',
					display: 'default',
				},
			];

			const response = {
				data: {
					body: cats,
					status: 200,
					headers: {
						'X-WP-Total': 1,
						'X-WP-TotalPages': 1,
					},
				},
			};

			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
				siteId,
				query: {},
			};
			onFetchSuccess( action, response )( dispatch );

			expect( dispatch ).calledWith( {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
				siteId,
				data: cats,
				total: 1,
				totalPages: 1,
				query: {},
			} );
		} );
	} );

	describe( '#onFetchError()', () => {
		test( 'should dispatch error', () => {
			const siteId = '123';
			const dispatch = spy();

			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
				siteId,
			};
			onFetchError( action, 'error' )( dispatch );

			expect( dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_FAILURE,
					siteId,
				} )
			);
		} );
	} );

	describe( '#handleProductCategoryCreate', () => {
		test( 'should dispatch a post action', () => {
			const store = {
				dispatch: spy(),
			};

			const category1 = { id: { index: 0 }, name: 'Category 1', slug: 'category-1' };
			const successAction = { type: '%%success%%' };
			const failureAction = { type: '%%failure%%' };
			const action = createProductCategory( 123, category1, successAction, failureAction );

			handleProductCategoryCreate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'post',
					siteId: 123,
					body: { name: 'Category 1', slug: 'category-1' },
					onFailureAction: failureAction,
				} ).and( match.has( 'onSuccessAction' ) )
			);
		} );

		test( 'should dispatch a success action with extra properties', () => {
			const store = {
				dispatch: spy(),
			};

			const category1 = { id: { placeholder: 'p1' }, name: 'Category 1', slug: 'category-1' };
			const successAction = { type: '%%success%%' };
			const action = createProductCategory( 123, category1, successAction );

			handleProductCategoryCreate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'post',
					siteId: 123,
					body: { name: 'Category 1', slug: 'category-1' },
				} )
			);

			const updatedSuccessAction = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
			expect( updatedSuccessAction ).to.be.a( 'function' );

			updatedSuccessAction( store.dispatch, null, { data: 'RECEIVED_DATA' } );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: '%%success%%',
					sentData: category1,
					receivedData: 'RECEIVED_DATA',
				} )
			);
		} );

		test( 'should dispatch a success function with extra parameters', () => {
			const store = {
				dispatch: spy(),
			};

			const category1 = { id: { placeholder: 'p1' }, name: 'Category 1', slug: 'category-1' };
			const successAction = ( dispatch, getState, { sentData, receivedData } ) => {
				return { type: '%%success%%', sentData, receivedData };
			};
			const action = createProductCategory( 123, category1, successAction );

			handleProductCategoryCreate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'post',
					siteId: 123,
					body: { name: 'Category 1', slug: 'category-1' },
				} )
			);

			const updatedSuccessAction = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
			expect( updatedSuccessAction ).to.be.a( 'function' );

			updatedSuccessAction( store.dispatch, null, { data: 'RECEIVED_DATA' } );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: '%%success%%',
					sentData: category1,
					receivedData: 'RECEIVED_DATA',
				} )
			);
		} );
	} );

	describe( '#handleProductCategoryUpdate', () => {
		test( 'should dispatch a put action', () => {
			const store = {
				dispatch: spy(),
			};

			const category = { id: 2, name: 'Category 1', slug: 'category-1' };
			const successAction = { type: '%%success%%' };
			const failureAction = { type: '%%failure%%' };
			const action = updateProductCategory( 123, category, successAction, failureAction );

			handleProductCategoryUpdate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'put',
					siteId: 123,
					body: { name: 'Category 1', slug: 'category-1' },
					onFailureAction: failureAction,
				} ).and( match.has( 'onSuccessAction' ) )
			);
		} );

		test( 'should dispatch a success action with extra properties', () => {
			const store = {
				dispatch: spy(),
			};

			const category = { id: 2, name: 'Category 1', slug: 'category-1' };
			const successAction = { type: '%%success%%' };
			const action = updateProductCategory( 123, category, successAction );

			handleProductCategoryUpdate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'put',
					siteId: 123,
					body: { name: 'Category 1', slug: 'category-1' },
				} )
			);

			const updatedSuccessAction = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
			expect( updatedSuccessAction ).to.be.a( 'function' );

			updatedSuccessAction( store.dispatch, null, { data: 'RECEIVED_DATA' } );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: '%%success%%',
					sentData: category,
					receivedData: 'RECEIVED_DATA',
				} )
			);

			const category2 = { id: 2, name: 'Category 1', slug: 'category-1' };
			const successAction2 = ( dispatch, getState, { sentData, receivedData } ) => {
				return { type: '%%success%%', sentData, receivedData };
			};
			const action2 = updateProductCategory( 123, category2, successAction2 );

			handleProductCategoryUpdate( store, action2 );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'put',
					siteId: 123,
					body: { name: 'Category 1', slug: 'category-1' },
				} )
			);

			const updatedSuccessAction2 = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
			expect( updatedSuccessAction2 ).to.be.a( 'function' );

			updatedSuccessAction( store.dispatch, null, { data: 'RECEIVED_DATA' } );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: '%%success%%',
					sentData: category,
					receivedData: 'RECEIVED_DATA',
				} )
			);
		} );
	} );
	describe( '#handleProductCategoryDelete', () => {
		test( 'should dispatch a delete action', () => {
			const store = {
				dispatch: spy(),
			};

			const category = { id: 2, name: 'Category 1', slug: 'category-1' };
			const action = deleteProductCategory( 123, category, noop, noop );

			handleProductCategoryDelete( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'del',
					siteId: 123,
					path: 'products/categories/2?force=true',
				} )
			);
		} );

		test( 'should dispatch a deleted action on success', () => {
			const store = {
				dispatch: spy(),
			};

			const siteId = 123;

			const category = { id: 2, name: 'Category 1', slug: 'category-1' };

			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORY_DELETE,
				siteId,
				category,
			};
			handleProductCategoryDeleteSuccess( store, action, category );

			expect( store.dispatch ).calledWith( {
				type: WOOCOMMERCE_PRODUCT_CATEGORY_DELETED,
				siteId,
				category,
			} );
		} );
	} );
} );
