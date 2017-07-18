/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getOrdersCurrentPage,
	getOrdersCurrentStatus
} from '../selectors';

const preInitializedState = {
	extensions: {
		woocommerce: {}
	}
};

const state = {
	ui: { selectedSiteId: 123 },
	extensions: {
		woocommerce: {
			ui: {
				orders: {
					123: {
						currentPage: 2,
						currentStatus: 'any',
					},
					234: {
						currentPage: 5,
						currentStatus: 'pending',
					},
				},
			},
		},
	},
};

describe( 'selectors', () => {
	describe( '#getOrdersCurrentPage', () => {
		it( 'should be 1 (default) when woocommerce state is not available', () => {
			expect( getOrdersCurrentPage( preInitializedState, 123 ) ).to.eql( 1 );
		} );

		it( 'should get the current order page', () => {
			expect( getOrdersCurrentPage( state, 123 ) ).to.eql( 2 );
		} );

		it( 'should get the current order page for a second site in the state', () => {
			expect( getOrdersCurrentPage( state, 234 ) ).to.eql( 5 );
		} );

		it( 'should get the siteId from the UI tree if not provided', () => {
			expect( getOrdersCurrentPage( state ) ).to.eql( 2 );
		} );
	} );

	describe( '#getOrdersCurrentStatus', () => {
		it( 'should be any (default) when woocommerce state is not available', () => {
			expect( getOrdersCurrentStatus( preInitializedState, 123 ) ).to.eql( 'any' );
		} );

		it( 'should get the current order status', () => {
			expect( getOrdersCurrentStatus( state, 123 ) ).to.eql( 'any' );
		} );

		it( 'should get the current order status for a second site in the state', () => {
			expect( getOrdersCurrentStatus( state, 234 ) ).to.eql( 'pending' );
		} );

		it( 'should get the siteId from the UI tree if not provided', () => {
			expect( getOrdersCurrentStatus( state ) ).to.eql( 'any' );
		} );
	} );
} );
