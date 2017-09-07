/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	clearOrder,
	editOrder,
	updateCurrentOrdersQuery,
} from '../actions';
import {
	WOOCOMMERCE_UI_ORDERS_CLEAR,
	WOOCOMMERCE_UI_ORDERS_EDIT,
	WOOCOMMERCE_UI_ORDERS_SET_QUERY,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#clearOrder()', () => {
		const siteId = '123';

		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			clearOrder( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_UI_ORDERS_CLEAR,
				siteId,
			} );
		} );
	} );

	describe( '#editOrder()', () => {
		const siteId = '123';

		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const order = {
				id: 40,
				first_name: 'Joan',
			};
			editOrder( siteId, order )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_UI_ORDERS_EDIT,
				siteId,
				order,
			} );
		} );
	} );

	describe( '#updateCurrentOrdersQuery()', () => {
		const siteId = '123';

		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			updateCurrentOrdersQuery( siteId, { page: 2, search: 'test' } )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_UI_ORDERS_SET_QUERY,
				siteId,
				query: { page: 2, search: 'test' }
			} );
		} );
	} );
} );
