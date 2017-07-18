/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { setCurrentQuery } from '../actions';
import { WOOCOMMERCE_UI_ORDERS_SET_QUERY } from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#setCurrentQuery()', () => {
		const siteId = '123';

		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			setCurrentQuery( siteId, { page: 2, status: 'completed' } )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_UI_ORDERS_SET_QUERY,
				siteId,
				query: { page: 2, status: 'completed' }
			} );
		} );
	} );
} );
