/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import {
	handleProductCategoryCreate,
	handleProductCategoriesRequest,
	handleProductCategoriesSuccess,
	handleProductCategoriesError,
} from '../';
import {
	WOOCOMMERCE_API_REQUEST,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_FAILURE,
} from 'woocommerce/state/action-types';
import { createProductCategory } from 'woocommerce/state/sites/product-categories/actions';
import { WPCOM_HTTP_REQUEST } from 'state/action-types';

describe( 'handlers', () => {
	describe( '#handleProductCategoriesRequest()', () => {
		test( 'should dispatch a get action', () => {
			const siteId = '123';
			const dispatch = spy();
			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
				siteId,
				query: {},
			};
			handleProductCategoriesRequest( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith(
				match( {
					type: WPCOM_HTTP_REQUEST,
					method: 'GET',
					path: `/jetpack-blogs/${ siteId }/rest-api/`,
					query: {
						path: '/wc/v3/products/categories&page=1&per_page=10&_envelope&_method=GET',
						json: true,
						apiVersion: '1.1',
					},
				} )
			);
		} );
	} );

	describe( '#handleProductCategoriesSuccess()', () => {
		test( 'should dispatch a success action with product category information when request completes', () => {
			const siteId = '123';
			const store = {
				dispatch: spy(),
			};

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
					},
				},
			};

			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
				siteId,
				query: {},
			};
			handleProductCategoriesSuccess( store, action, response );

			expect( store.dispatch ).calledWith( {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
				siteId,
				data: cats,
				total: 1,
				query: {},
			} );
		} );
		test( 'should dispatch with an error if the envelope response is not 200', () => {
			const siteId = '123';
			const store = {
				dispatch: spy(),
			};

			const response = {
				data: {
					body: {
						message: 'No route was found matching the URL and request method',
						code: 'rest_no_route',
					},
					status: 404,
				},
			};

			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
				siteId,
				query: {},
			};
			handleProductCategoriesSuccess( store, action, response );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_FAILURE,
					siteId,
				} )
			);
		} );
		test( 'should dispatch with an error if the response is not valid', () => {
			const siteId = '123';
			const store = {
				dispatch: spy(),
			};

			const response = {
				data: {
					body: [ { bogus: 'test' } ],
					status: 200,
				},
			};

			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
				siteId,
			};
			handleProductCategoriesSuccess( store, action, response );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_FAILURE,
					siteId,
				} )
			);
		} );
	} );

	describe( '#handleProductCategoriesError()', () => {
		test( 'should dispatch error', () => {
			const siteId = '123';
			const store = {
				dispatch: spy(),
			};

			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
				siteId,
			};
			handleProductCategoriesError( store, action, 'error' );

			expect( store.dispatch ).to.have.been.calledWith(
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
} );
