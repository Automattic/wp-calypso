/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	areOrdersLoaded,
	areOrdersLoading,
	getOrders,
} from '../selectors';
import { LOADING } from 'woocommerce/state/constants';

const preInitializedState = {
	extensions: {
		woocommerce: {},
	},
};
const loadingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					orders: LOADING,
				},
			},
		},
	},
};
const loadedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					orders: [
						{ id: 1, total: '20.00' },
						{ id: 2, total: '35.00' }
					],
				},
				401: {
					orders: LOADING,
				},
			},
		},
	},
};

const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#areOrdersLoaded', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( areOrdersLoaded( preInitializedState, 123 ) ).to.be.false;
		} );

		it( 'should be false when settings are currently being fetched.', () => {
			expect( areOrdersLoaded( loadingState, 123 ) ).to.be.false;
		} );

		it( 'should be true when settings are loaded.', () => {
			expect( areOrdersLoaded( loadedState, 123 ) ).to.be.true;
		} );

		it( 'should be false when settings are loaded only for a different site.', () => {
			expect( areOrdersLoaded( loadedState, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areOrdersLoaded( loadedStateWithUi ) ).to.be.true;
		} );
	} );

	describe( '#areOrdersLoading', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( areOrdersLoading( preInitializedState, 123 ) ).to.be.false;
		} );

		it( 'should be true when settings are currently being fetched.', () => {
			expect( areOrdersLoading( loadingState, 123 ) ).to.be.true;
		} );

		it( 'should be false when settings are loaded.', () => {
			expect( areOrdersLoading( loadedState, 123 ) ).to.be.false;
		} );

		it( 'should be false when settings are loaded only for a different site.', () => {
			expect( areOrdersLoading( loadedState, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areOrdersLoading( loadedStateWithUi ) ).to.be.false;
		} );
	} );

	describe( '#getOrders', () => {
		it( 'should be an empty array when woocommerce state is not available.', () => {
			expect( getOrders( preInitializedState, 123 ) ).to.be.empty;
		} );

		it( 'should be an empty array when orders are loading.', () => {
			expect( getOrders( loadingState, 123 ) ).to.be.empty;
		} );

		it( 'should be the list of orders if they are loaded.', () => {
			expect( getOrders( loadedState, 123 ) ).to.eql( [
				{ id: 1, total: '20.00' },
				{ id: 2, total: '35.00' }
			] );
		} );

		it( 'should be an empty array when orders are loaded only for a different site.', () => {
			expect( getOrders( loadedState, 456 ) ).to.be.empty;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getOrders( loadedStateWithUi ) ).to.eql( [
				{ id: 1, total: '20.00' },
				{ id: 2, total: '35.00' }
			] );
		} );
	} );
} );
