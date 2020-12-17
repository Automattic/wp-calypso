/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

jest.mock( 'calypso/lib/warn', () => () => {} );

/**
 * Internal dependencies
 */
import {
	createProduct,
	updateProduct,
	fetchProduct,
	fetchProducts,
	productsUpdated,
} from 'woocommerce/state/sites/products/actions';
import {
	apiError,
	handleProductCreate,
	handleProductUpdate,
	handleProductRequest,
	productsRequest,
	receivedProducts,
} from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	WOOCOMMERCE_API_REQUEST,
	WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'handlers', () => {
	describe( '#handleProductCreate', () => {
		test( 'should dispatch a post action', () => {
			const store = {
				dispatch: spy(),
			};

			const product1 = { id: { index: 0 }, name: 'Product #1', type: 'simple' };
			const successAction = { type: '%%success%%' };
			const failureAction = { type: '%%failure%%' };
			const action = createProduct( 123, product1, successAction, failureAction );

			handleProductCreate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'post',
					siteId: 123,
					onFailureAction: failureAction,
					body: { name: 'Product #1', type: 'simple' },
				} ).and( match.has( 'onSuccessAction' ) )
			);
		} );

		test( 'should dispatch a success action with extra properties', () => {
			const store = {
				dispatch: spy(),
			};

			const product1 = { id: { index: 0 }, name: 'Product #1', type: 'simple' };
			const successAction = { type: '%%success%%' };
			const action = createProduct( 123, product1, successAction );

			handleProductCreate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'post',
					siteId: 123,
					body: { name: 'Product #1', type: 'simple' },
				} )
			);

			const updatedSuccessAction = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
			expect( updatedSuccessAction ).to.be.a( 'function' );

			updatedSuccessAction( store.dispatch, null, { data: 'RECEIVED_DATA' } );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: '%%success%%',
					sentData: product1,
					receivedData: 'RECEIVED_DATA',
				} )
			);
		} );

		test( 'should dispatch a success function with extra properties', () => {
			const store = {
				dispatch: spy(),
			};

			const product1 = { id: { index: 0 }, name: 'Product #1', type: 'simple' };
			const successAction = ( dispatch, getState, { sentData, receivedData } ) => {
				return { type: '%%success%%', sentData, receivedData };
			};
			const action = createProduct( 123, product1, successAction );

			handleProductCreate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'post',
					siteId: 123,
					body: { name: 'Product #1', type: 'simple' },
				} )
			);

			const updatedSuccessAction = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
			expect( updatedSuccessAction ).to.be.a( 'function' );

			updatedSuccessAction( store.dispatch, null, { data: 'RECEIVED_DATA' } );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: '%%success%%',
					sentData: product1,
					receivedData: 'RECEIVED_DATA',
				} )
			);
		} );
	} );

	describe( '#handleProductUpdate', () => {
		test( 'should dispatch a put action', () => {
			const store = {
				dispatch: spy(),
			};

			const product1 = { id: 42, name: 'Product #1', type: 'simple' };
			const successAction = { type: '%%success%%' };
			const failureAction = { type: '%%failure%%' };
			const action = updateProduct( 123, product1, successAction, failureAction );

			handleProductUpdate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'put',
					siteId: 123,
					onFailureAction: failureAction,
					body: product1,
				} ).and( match.has( 'onSuccessAction' ) )
			);
		} );

		test( 'should dispatch a success action with extra properties', () => {
			const store = {
				dispatch: spy(),
			};

			const product1 = { id: 42, name: 'Product #1', type: 'simple' };
			const successAction = { type: '%%success%%' };
			const action = updateProduct( 123, product1, successAction );

			handleProductUpdate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'put',
					siteId: 123,
					body: product1,
				} )
			);

			const updatedSuccessAction = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
			expect( updatedSuccessAction ).to.be.a( 'function' );

			updatedSuccessAction( store.dispatch, null, { data: 'RECEIVED_DATA' } );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: '%%success%%',
					sentData: product1,
					receivedData: 'RECEIVED_DATA',
				} )
			);
		} );

		test( 'should dispatch a success function with extra properties', () => {
			const store = {
				dispatch: spy(),
			};

			const product1 = { id: 42, name: 'Product #1', type: 'simple' };
			const successAction = ( dispatch, getState, { sentData, receivedData } ) => {
				return { type: '%%success%%', sentData, receivedData };
			};
			const action = updateProduct( 123, product1, successAction );

			handleProductUpdate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'put',
					siteId: 123,
					body: product1,
				} )
			);

			const updatedSuccessAction = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
			expect( updatedSuccessAction ).to.be.a( 'function' );

			updatedSuccessAction( store.dispatch, null, { data: 'RECEIVED_DATA' } );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: '%%success%%',
					sentData: product1,
					receivedData: 'RECEIVED_DATA',
				} )
			);
		} );
	} );

	describe( '#handleProductRequest', () => {
		test( 'should dispatch a get action', () => {
			const store = {
				dispatch: spy(),
			};

			const successAction = { type: '%%success%%' };
			const failureAction = { type: '%%failure%%' };
			const action = fetchProduct( 123, 42, successAction, failureAction );

			handleProductRequest( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'get',
					siteId: 123,
					onFailureAction: failureAction,
				} ).and( match.has( 'onSuccessAction' ) )
			);
		} );

		test( 'should dispatch a success action with extra properties', () => {
			const store = {
				dispatch: spy(),
			};

			const successAction = { type: '%%success%%' };
			const action = fetchProduct( 123, 42, successAction );

			handleProductRequest( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'get',
					siteId: 123,
				} )
			);

			const updatedSuccessAction = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
			expect( updatedSuccessAction ).to.be.a( 'function' );

			updatedSuccessAction( store.dispatch, null, { data: 'RECEIVED_DATA' } );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: '%%success%%',
					sentData: undefined,
					receivedData: 'RECEIVED_DATA',
				} )
			);
		} );

		test( 'should dispatch a success function with extra properties', () => {
			const store = {
				dispatch: spy(),
			};

			const successAction = ( dispatch, getState, { sentData, receivedData } ) => {
				return { type: '%%success%%', sentData, receivedData };
			};
			const action = fetchProduct( 123, 42, successAction );

			handleProductRequest( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'get',
					siteId: 123,
				} )
			);

			const updatedSuccessAction = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
			expect( updatedSuccessAction ).to.be.a( 'function' );

			updatedSuccessAction( store.dispatch, null, { data: 'RECEIVED_DATA' } );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: '%%success%%',
					sentData: undefined,
					receivedData: 'RECEIVED_DATA',
				} )
			);
		} );
	} );

	describe( '#productsRequest', () => {
		test( 'should dispatch a get action', () => {
			const action = fetchProducts( 123, {} );
			const result = productsRequest( action );

			expect( result ).to.eql(
				http(
					{
						method: 'GET',
						path: '/jetpack-blogs/123/rest-api/',
						apiVersion: '1.1',
						body: null,
						query: {
							json: true,
							path: '/wc/v3/products&page=1&per_page=10&_envelope&_method=GET',
						},
					},
					action
				)
			);
		} );
	} );

	describe( '#receivedProducts', () => {
		test( 'should dispatch a success action on a good response', () => {
			const dispatch = spy();

			const products = [
				{ id: 1, name: 'Mittens' },
				{ id: 2, name: 'Scarf' },
			];
			const data = {
				status: 200,
				body: products,
				headers: {
					'X-WP-TotalPages': 1,
					'X-WP-Total': 2,
				},
			};
			const action = productsUpdated( 123, {}, products, 1, 2 );

			receivedProducts( { dispatch }, action, { data } );

			expect( dispatch ).to.have.been.calledWithMatch(
				match( {
					type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
					siteId: 123,
					products,
					params: {},
					totalPages: 1,
					totalProducts: 2,
				} )
			);
		} );

		test( 'should dispatch a failure action on a bad response', () => {
			const dispatch = spy();

			const response = {
				code: 'rest_no_route',
				data: { status: 404 },
				message: 'No route was found matching the URL and request method',
			};
			const action = productsUpdated( 123, {}, response, 1, 2 );
			const data = {
				status: 404,
				body: response,
				headers: [],
			};

			receivedProducts( { dispatch }, action, { data } );
			expect( dispatch ).to.have.been.calledWithMatch(
				match( {
					type: WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
					siteId: 123,
				} )
			);
		} );

		test( 'apiError should dispatch a failure action on a failed fetchProducts', () => {
			const dispatch = spy();

			const response = {
				code: 'rest_no_route',
				data: { status: 404 },
				message: 'No route was found matching the URL and request method',
			};
			const action = fetchProducts( 123, {} );
			const data = {
				status: 404,
				body: response,
				headers: [],
			};

			apiError( { dispatch }, action, { data } );
			expect( dispatch ).to.have.been.calledWithMatch(
				match( {
					type: WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
					siteId: 123,
					params: {},
				} )
			);
		} );
	} );
} );
