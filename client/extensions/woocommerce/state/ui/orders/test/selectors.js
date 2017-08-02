/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getOrdersCurrentPage,
	getOrdersCurrentSearch
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
						currentSearch: 'example',
					},
					234: {
						currentPage: 5,
						currentSearch: 'test',
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

	describe( '#getOrdersCurrentSearch', () => {
		it( 'should be any (default) when woocommerce state is not available', () => {
			expect( getOrdersCurrentSearch( preInitializedState, 123 ) ).to.eql( '' );
		} );

		it( 'should get the current search term', () => {
			expect( getOrdersCurrentSearch( state, 123 ) ).to.eql( 'example' );
		} );

		it( 'should get the current search term for a second site in the state', () => {
			expect( getOrdersCurrentSearch( state, 234 ) ).to.eql( 'test' );
		} );

		it( 'should get the siteId from the UI tree if not provided', () => {
			expect( getOrdersCurrentSearch( state ) ).to.eql( 'example' );
		} );
	} );
} );
