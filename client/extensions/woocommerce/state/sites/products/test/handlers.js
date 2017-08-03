/**
 * External dependencies
 */
import { expect } from 'chai';
import { noop } from 'lodash';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import {
	createProduct,
	updateProduct,
	fetchProduct,
	fetchProducts,
} from 'woocommerce/state/sites/products/actions';
import {
	handleProductCreate,
	handleProductUpdate,
	handleProductRequest,
	handleProductsRequest,
	handleProductsRequestSuccess,
	handleProductsRequestError,
} from '../handlers';
import {
	WOOCOMMERCE_API_REQUEST,
	WOOCOMMERCE_PRODUCTS_RECEIVE,
} from 'woocommerce/state/action-types';
import { WPCOM_HTTP_REQUEST } from 'state/action-types';
import products from 'woocommerce/state/sites/products/test/fixtures/products';

describe( 'handlers', () => {
	describe( '#handleProductCreate', () => {
		it( 'should dispatch a post action', () => {
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

		it( 'should dispatch a success action with extra properties', () => {
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

		it( 'should dispatch a success function with extra properties', () => {
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
		it( 'should dispatch a put action', () => {
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

		it( 'should dispatch a success action with extra properties', () => {
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

		it( 'should dispatch a success function with extra properties', () => {
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
		it( 'should dispatch a get action', () => {
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

		it( 'should dispatch a success action with extra properties', () => {
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

		it( 'should dispatch a success function with extra properties', () => {
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
	describe( '#handleProductsRequest', () => {
		it( 'should dispatch a get action', () => {
			const siteId = '123';
			const dispatch = spy();
			const action = fetchProducts( siteId, 1 );

			handleProductsRequest( { dispatch }, action, noop );
			expect( dispatch ).to.have.been.calledWith( match( {
				type: WPCOM_HTTP_REQUEST,
				method: 'GET',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
				query: {
					path: '/wc/v3/products&page=1&per_page=10&_envelope&_method=GET',
					json: true,
					apiVersion: '1.1',
				}
			} ) );
		} );
	} );
	describe( '#handleProductsRequestSuccess()', () => {
		it( 'should dispatch products receive with the products list', () => {
			const siteId = '123';
			const store = {
				dispatch: spy(),
			};
			const response = { data: {
				body: products,
				status: 200,
				headers: {
					'X-WP-TotalPages': 1,
					'X-WP-Total': 2,
				}
			} };

			const action = fetchProducts( siteId, 1 );
			handleProductsRequestSuccess( store, action, noop, response );

			expect( store.dispatch ).calledWith( {
				type: WOOCOMMERCE_PRODUCTS_RECEIVE,
				siteId,
				products,
				page: 1,
				totalPages: 1,
				totalProducts: 2,
			} );
		} );
		it( 'should dispatch with an error if the envelope response is not 200', () => {
			const siteId = '123';
			const store = {
				dispatch: spy(),
			};
			const response = { data: {
				body: {
					message: 'No route was found matching the URL and request method',
					code: 'rest_no_route',
				},
				status: 404,
			} };

			const action = fetchProducts( siteId, 1 );
			handleProductsRequestSuccess( store, action, noop, response );

			expect( store.dispatch ).calledWith( {
				type: WOOCOMMERCE_PRODUCTS_RECEIVE,
				siteId,
				page: 1,
				error: 'rest_no_route',
			} );
		} );
	} );
	describe( '#handleSettingsGeneralError()', () => {
		it( 'should dispatch error', () => {
			const siteId = '123';
			const store = {
				dispatch: spy(),
			};

			const action = fetchProducts( siteId, 1 );
			handleProductsRequestError( store, action, noop, 'rest_no_route' );

			expect( store.dispatch ).to.have.been.calledWithMatch( {
				type: WOOCOMMERCE_PRODUCTS_RECEIVE,
				siteId,
				page: 1,
				error: 'rest_no_route',
			} );
		} );
	} );
} );
