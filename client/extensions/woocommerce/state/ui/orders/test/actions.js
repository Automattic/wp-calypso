/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { updateCurrentOrdersQuery } from '../actions';
import { WOOCOMMERCE_UI_ORDERS_SET_QUERY } from 'woocommerce/state/action-types';

describe( 'actions', () => {
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
