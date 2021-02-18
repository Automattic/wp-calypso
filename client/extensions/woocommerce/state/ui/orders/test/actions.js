/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { clearOrderEdits, editOrder, updateCurrentOrdersQuery } from '../actions';
import {
	WOOCOMMERCE_UI_ORDERS_CLEAR_EDIT,
	WOOCOMMERCE_UI_ORDERS_EDIT,
	WOOCOMMERCE_UI_ORDERS_SET_QUERY,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#clearOrderEdits()', () => {
		const siteId = '123';

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			clearOrderEdits( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_UI_ORDERS_CLEAR_EDIT,
				siteId,
			} );
		} );
	} );

	describe( '#editOrder()', () => {
		const siteId = '123';

		test( 'should dispatch an action', () => {
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

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			updateCurrentOrdersQuery( siteId, { page: 2, search: 'test' } )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_UI_ORDERS_SET_QUERY,
				siteId,
				query: { page: 2, search: 'test' },
			} );
		} );
	} );
} );
