/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { setCurrentPage } from '../actions';
import { WOOCOMMERCE_UI_ORDERS_SET_PAGE } from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#setCurrentPage()', () => {
		const siteId = '123';

		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			setCurrentPage( siteId, 2 )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( { type: WOOCOMMERCE_UI_ORDERS_SET_PAGE, siteId, page: 2 } );
		} );
	} );
} );
