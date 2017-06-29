/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import { createProduct } from 'woocommerce/state/sites/products/actions';
import {
	handleProductCreate,
} from '../';
import {
	WOOCOMMERCE_API_REQUEST,
} from 'woocommerce/state/action-types';

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

			updatedSuccessAction( store.dispatch, null, 'RECEIVED_DATA' );

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
			const successAction = ( dispatch, getState, sentData, receivedData ) => {
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

			updatedSuccessAction( store.dispatch, null, 'RECEIVED_DATA' );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: '%%success%%',
					sentData: product1,
					receivedData: 'RECEIVED_DATA',
				} )
			);
		} );
	} );
} );

