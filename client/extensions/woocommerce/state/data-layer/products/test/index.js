/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import { createProduct, productUpdated } from 'woocommerce/state/sites/products/actions';
import {
	handleProductCreate,
	handleProductUpdated,
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
					onSuccessAction: productUpdated( 123, null, successAction ),
					onFailureAction: failureAction,
					body: { name: 'Product #1', type: 'simple' },
				} )
			);
		} );
	} );

	describe( '#handleProductUpdated', () => {
		it( 'should dispatch a completion action', () => {
			const store = {
				dispatch: spy(),
			};

			const product1 = { id: 101, name: 'Newly Created Product', type: 'simple' };
			const completionAction = { type: '%%complete%%' };
			const action = productUpdated( 123, product1, completionAction );

			handleProductUpdated( store, action );

			expect( store.dispatch ).to.have.been.calledWith( completionAction );
		} );
	} );
} );

