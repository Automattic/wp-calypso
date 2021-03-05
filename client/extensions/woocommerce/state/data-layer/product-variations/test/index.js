/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import {
	handleProductVariationCreate,
	handleProductVariationDelete,
	handleProductVariationUpdate,
	handleProductVariationsRequest,
} from '../';
import { WOOCOMMERCE_API_REQUEST } from 'woocommerce/state/action-types';
import {
	createProductVariation,
	deleteProductVariation,
	fetchProductVariations,
	updateProductVariation,
} from 'woocommerce/state/sites/product-variations/actions';

describe( 'handlers', () => {
	describe( '#handleProductVariationsRequest', () => {
		test( 'should dispatch a get action', () => {
			const store = {
				dispatch: spy(),
			};

			const successAction = { type: '%%success%%' };
			const failureAction = { type: '%%failure%%' };
			const action = fetchProductVariations( 123, 42, successAction, failureAction );

			handleProductVariationsRequest( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'get',
					siteId: 123,
					onFailureAction: failureAction,
				} ).and( match.has( 'onSuccessAction' ) )
			);
		} );
	} );

	test( 'should dispatch a success action with extra properties', () => {
		const store = {
			dispatch: spy(),
		};

		const successAction = { type: '%%success%%' };
		const action = fetchProductVariations( 123, 42, successAction );

		handleProductVariationsRequest( store, action );

		expect( store.dispatch ).to.have.been.calledWith(
			match( {
				type: WOOCOMMERCE_API_REQUEST,
				method: 'get',
				siteId: 123,
			} )
		);

		const updatedSuccessAction = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
		expect( updatedSuccessAction ).to.be.a( 'function' );

		updatedSuccessAction( store.dispatch, null, { data: [ { id: 421 } ] } );

		expect( store.dispatch ).to.have.been.calledWith(
			match( {
				type: '%%success%%',
				sentData: undefined,
				receivedData: [ { id: 421 } ],
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
		const action = fetchProductVariations( 123, 42, successAction );

		handleProductVariationsRequest( store, action );

		expect( store.dispatch ).to.have.been.calledWith(
			match( {
				type: WOOCOMMERCE_API_REQUEST,
				method: 'get',
				siteId: 123,
			} )
		);

		const updatedSuccessAction = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
		expect( updatedSuccessAction ).to.be.a( 'function' );

		updatedSuccessAction( store.dispatch, null, { data: [ { id: 421 } ] } );

		expect( store.dispatch ).to.have.been.calledWith(
			match( {
				type: '%%success%%',
				sentData: undefined,
				receivedData: [ { id: 421 } ],
			} )
		);
	} );

	describe( '#handleProductVariationCreate', () => {
		test( 'should dispatch a post action', () => {
			const store = {
				dispatch: spy(),
			};

			const variation1 = {
				id: { index: 10 },
				attributes: [ { id: 9, option: 'Black' } ],
			};
			const successAction = { type: '%%success%%' };
			const failureAction = { type: '%%failure%%' };
			const action = createProductVariation( 123, 66, variation1, successAction, failureAction );

			handleProductVariationCreate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'post',
					siteId: 123,
					onFailureAction: failureAction,
					body: { attributes: variation1.attributes },
				} ).and( match.has( 'onSuccessAction' ) )
			);
		} );

		test( 'should dispatch a success action with extra properties', () => {
			const store = {
				dispatch: spy(),
			};

			const variation1 = {
				id: { index: 10 },
				attributes: [ { id: 9, option: 'Black' } ],
			};

			const successAction = { type: '%%success%%' };
			const action = createProductVariation( 123, 66, variation1, successAction );

			handleProductVariationCreate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( { type: WOOCOMMERCE_API_REQUEST } )
			);

			const updatedSuccessAction = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
			expect( updatedSuccessAction ).to.be.a( 'function' );

			updatedSuccessAction( store.dispatch, null, { data: 'RECEIVED_DATA' } );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: '%%success%%',
					productId: 66,
					sentData: variation1,
					receivedData: 'RECEIVED_DATA',
				} )
			);
		} );

		test( 'should dispatch a success function with extra properties', () => {
			const store = {
				dispatch: spy(),
			};

			const variation1 = {
				id: { index: 10 },
				attributes: [ { id: 9, option: 'Black' } ],
			};

			const successAction = ( dispatch, getState, { productId, sentData, receivedData } ) => {
				return { type: '%%success%%', productId, sentData, receivedData };
			};
			const action = createProductVariation( 123, 66, variation1, successAction );

			handleProductVariationCreate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( { type: WOOCOMMERCE_API_REQUEST } )
			);

			const updatedSuccessAction = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
			expect( updatedSuccessAction ).to.be.a( 'function' );

			updatedSuccessAction( store.dispatch, null, { data: 'RECEIVED_DATA' } );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: '%%success%%',
					productId: 66,
					sentData: variation1,
					receivedData: 'RECEIVED_DATA',
				} )
			);
		} );
	} );

	describe( '#handleProductVariationUpdate', () => {
		test( 'should dispatch a put action', () => {
			const store = {
				dispatch: spy(),
			};

			const variation1 = {
				id: 202,
				attributes: [ { id: 9, option: 'Black' } ],
			};
			const successAction = { type: '%%success%%' };
			const failureAction = { type: '%%failure%%' };
			const action = updateProductVariation( 123, 66, variation1, successAction, failureAction );

			handleProductVariationUpdate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'put',
					siteId: 123,
					onFailureAction: failureAction,
					body: variation1,
				} ).and( match.has( 'onSuccessAction' ) )
			);
		} );

		test( 'should dispatch a success action with extra properties', () => {
			const store = {
				dispatch: spy(),
			};

			const variation1 = {
				id: 202,
				attributes: [ { id: 9, option: 'Black' } ],
			};

			const successAction = { type: '%%success%%' };
			const action = updateProductVariation( 123, 66, variation1, successAction );

			handleProductVariationUpdate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( { type: WOOCOMMERCE_API_REQUEST } )
			);

			const updatedSuccessAction = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
			expect( updatedSuccessAction ).to.be.a( 'function' );

			updatedSuccessAction( store.dispatch, null, { data: 'RECEIVED_DATA' } );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: '%%success%%',
					productId: 66,
					sentData: variation1,
					receivedData: 'RECEIVED_DATA',
				} )
			);
		} );

		test( 'should dispatch a success function with extra properties', () => {
			const store = {
				dispatch: spy(),
			};

			const variation1 = {
				id: 202,
				attributes: [ { id: 9, option: 'Black' } ],
			};

			const successAction = ( dispatch, getState, { productId, sentData, receivedData } ) => {
				return { type: '%%success%%', productId, sentData, receivedData };
			};
			const action = updateProductVariation( 123, 66, variation1, successAction );

			handleProductVariationUpdate( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( { type: WOOCOMMERCE_API_REQUEST } )
			);

			const updatedSuccessAction = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
			expect( updatedSuccessAction ).to.be.a( 'function' );

			updatedSuccessAction( store.dispatch, null, { data: 'RECEIVED_DATA' } );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: '%%success%%',
					productId: 66,
					sentData: variation1,
					receivedData: 'RECEIVED_DATA',
				} )
			);
		} );
	} );

	describe( '#handleProductVariationDelete', () => {
		test( 'should dispatch a delete action', () => {
			const store = {
				dispatch: spy(),
			};

			const successAction = { type: '%%success%%' };
			const failureAction = { type: '%%failure%%' };
			const action = deleteProductVariation( 123, 66, 202, successAction, failureAction );

			handleProductVariationDelete( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WOOCOMMERCE_API_REQUEST,
					method: 'del',
					siteId: 123,
					path: 'products/66/variations/202',
					onFailureAction: failureAction,
				} ).and( match.has( 'onSuccessAction' ) )
			);
		} );

		test( 'should dispatch a success action with extra properties', () => {
			const store = {
				dispatch: spy(),
			};

			const successAction = { type: '%%success%%' };
			const action = deleteProductVariation( 123, 66, 202, successAction );

			handleProductVariationDelete( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( { type: WOOCOMMERCE_API_REQUEST } )
			);

			const updatedSuccessAction = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
			expect( updatedSuccessAction ).to.be.a( 'function' );

			updatedSuccessAction( store.dispatch, null, 'RECEIVED_DATA' );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: '%%success%%',
					productId: 66,
					sentData: { id: 202 },
					receivedData: 'RECEIVED_DATA',
				} )
			);
		} );

		test( 'should dispatch a success function with extra properties', () => {
			const store = {
				dispatch: spy(),
			};

			const successAction = ( dispatch, getState, { productId, sentData, receivedData } ) => {
				return { type: '%%success%%', productId, sentData, receivedData };
			};
			const action = deleteProductVariation( 123, 66, 202, successAction );

			handleProductVariationDelete( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( { type: WOOCOMMERCE_API_REQUEST } )
			);

			const updatedSuccessAction = store.dispatch.firstCall.args[ 0 ].onSuccessAction;
			expect( updatedSuccessAction ).to.be.a( 'function' );

			updatedSuccessAction( store.dispatch, null, 'RECEIVED_DATA' );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: '%%success%%',
					productId: 66,
					sentData: { id: 202 },
					receivedData: 'RECEIVED_DATA',
				} )
			);
		} );
	} );
} );
