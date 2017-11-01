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
	createProduct,
	updateProduct,
	fetchProduct,
	fetchProducts,
} from 'woocommerce/state/sites/products/actions';
import {
	handleProductCreate,
	handleProductUpdate,
	handleProductRequest,
	productsRequest,
} from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { WOOCOMMERCE_API_REQUEST } from 'woocommerce/state/action-types';

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
			const dispatch = spy();

			const action = fetchProducts( 123, {} );

			productsRequest( { dispatch }, action );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
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
} );
