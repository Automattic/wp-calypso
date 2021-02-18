/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	areCountsLoading,
	getCountProducts,
	getCountNewOrders,
	getCountPendingReviews,
} from '../selectors';
import count from './fixtures/count';

const stateWithCounts = ( isLoading, items ) => ( {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					data: { counts: { isLoading, items } },
				},
			},
		},
	},
	ui: {
		selectedSiteId: 123,
	},
} );

describe( 'selectors', () => {
	describe( '#areCountsLoading', () => {
		test( 'should return false when woocommerce state is not available.', () => {
			expect( areCountsLoading( stateWithCounts( null, null ), 123 ) ).to.be.false;
		} );

		test( 'should return false when counts are loaded.', () => {
			expect( areCountsLoading( stateWithCounts( false, count ), 123 ) ).to.be.false;
		} );

		test( 'should return true when counts are currently being fetched.', () => {
			expect( areCountsLoading( stateWithCounts( true, null ), 123 ) ).to.be.true;
		} );
	} );

	describe( '#getCountProducts', () => {
		test( 'should return 0 when counts are currently being fetched.', () => {
			expect( getCountProducts( stateWithCounts( true, null ), 123 ) ).to.eql( 0 );
		} );

		test( 'should return product count when counts are loaded.', () => {
			expect( getCountProducts( stateWithCounts( false, count ), 123 ) ).to.eql( 5 );
		} );
	} );

	describe( '#getCountNewOrders', () => {
		test( 'should return 0 when counts are currently being fetched.', () => {
			expect( getCountNewOrders( stateWithCounts( true, null ), 123 ) ).to.eql( 0 );
		} );

		test( 'should return total of all non-finished orders when counts are loaded.', () => {
			expect( getCountNewOrders( stateWithCounts( false, count ), 123 ) ).to.eql( 6 );
		} );
	} );

	describe( '#getCountPendingReviews', () => {
		test( 'should return 0 when counts are currently being fetched.', () => {
			expect( getCountPendingReviews( stateWithCounts( true, null ), 123 ) ).to.eql( 0 );
		} );

		test( 'should return pending review count when counts are loaded.', () => {
			expect( getCountPendingReviews( stateWithCounts( false, count ), 123 ) ).to.eql( 1 );
		} );
	} );
} );
