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
	WOOCOMMERCE_ERROR_SET,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
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
			};
			handleProductCategoriesRequest( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith(
				match( {
					type: WPCOM_HTTP_REQUEST,
					method: 'GET',
					path: `/jetpack-blogs/${ siteId }/rest-api/`,
					query: {
						path: '/wc/v3/products/categories&_method=GET',
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

			const response = [
				{
					id: 10,
					name: 'Tops',
					slug: 'tops',
					description: '',
					display: 'default',
				},
			];

			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
				siteId,
			};
			handleProductCategoriesSuccess( store, action, { data: response } );

			expect( store.dispatch ).calledWith( {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
				siteId,
				data: response,
			} );
		} );
		test( 'should dispatch with an error if the response is not valid', () => {
			const siteId = '123';
			const store = {
				dispatch: spy(),
			};
			const response = [ { bogus: 'test' } ];

			const action = {
				type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
				siteId,
			};
			handleProductCategoriesSuccess( store, action, { data: response } );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_ERROR_SET,
					siteId,
					originalAction: action,
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
					type: WOOCOMMERCE_ERROR_SET,
					siteId,
					originalAction: action,
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
