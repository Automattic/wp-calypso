/**
 * External dependencies
 */
import { expect } from 'chai';
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import {
	areOrdersLoaded,
	areOrdersLoading,
	getOrders,
	getTotalOrdersPages,
} from '../selectors';
import orders from './fixtures/orders';

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
					orders: {
						isLoading: {
							1: true,
						},
						items: {},
						pages: {},
						totalPages: 1
					},
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
					orders: {
						isLoading: {
							1: false,
						},
						items: keyBy( orders, 'id' ),
						pages: {
							1: [ 35, 26 ]
						},
						totalPages: 4
					}
				},
				401: {
					orders: {
						isLoading: {
							1: true,
						},
						items: {},
						pages: {},
						totalPages: 1
					},
				},
			},
		},
	},
};

const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#areOrdersLoaded', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( areOrdersLoaded( preInitializedState, 1, 123 ) ).to.be.false;
		} );

		it( 'should be false when orders are currently being fetched.', () => {
			expect( areOrdersLoaded( loadingState, 1, 123 ) ).to.be.false;
		} );

		it( 'should be true when orders are loaded.', () => {
			expect( areOrdersLoaded( loadedState, 1, 123 ) ).to.be.true;
		} );

		it( 'should be false when orders are loaded only for a different site.', () => {
			expect( areOrdersLoaded( loadedState, 1, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areOrdersLoaded( loadedStateWithUi, 1 ) ).to.be.true;
		} );
	} );

	describe( '#areOrdersLoading', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( areOrdersLoading( preInitializedState, 1, 123 ) ).to.be.false;
		} );

		it( 'should be true when orders are currently being fetched.', () => {
			expect( areOrdersLoading( loadingState, 1, 123 ) ).to.be.true;
		} );

		it( 'should be false when orders are loaded.', () => {
			expect( areOrdersLoading( loadedState, 1, 123 ) ).to.be.false;
		} );

		it( 'should be false when orders are loaded only for a different site.', () => {
			expect( areOrdersLoading( loadedState, 1, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areOrdersLoading( loadedStateWithUi, 1 ) ).to.be.false;
		} );
	} );

	describe( '#getOrders', () => {
		it( 'should be an empty array when woocommerce state is not available.', () => {
			expect( getOrders( preInitializedState, 1, 123 ) ).to.be.empty;
		} );

		it( 'should be an empty array when orders are loading.', () => {
			expect( getOrders( loadingState, 1, 123 ) ).to.be.empty;
		} );

		it( 'should be the list of orders if they are loaded.', () => {
			expect( getOrders( loadedState, 1, 123 ) ).to.eql( orders );
		} );

		it( 'should be an empty array when orders are loaded only for a different site.', () => {
			expect( getOrders( loadedState, 1, 456 ) ).to.be.empty;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getOrders( loadedStateWithUi, 1 ) ).to.eql( orders );
		} );
	} );

	describe( '#getTotalOrdersPages', () => {
		it( 'should be 1 (default) when woocommerce state is not available.', () => {
			expect( getTotalOrdersPages( preInitializedState, 123 ) ).to.eql( 1 );
		} );

		it( 'should be 1 (default) when orders are loading.', () => {
			expect( getTotalOrdersPages( loadingState, 123 ) ).to.eql( 1 );
		} );

		it( 'should be 4, the set page total, if the orders are loaded.', () => {
			expect( getTotalOrdersPages( loadedState, 123 ) ).to.eql( 4 );
		} );

		it( 'should be 1 (default) when orders are loaded only for a different site.', () => {
			expect( getTotalOrdersPages( loadedState, 456 ) ).to.eql( 1 );
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getTotalOrdersPages( loadedStateWithUi ) ).to.eql( 4 );
		} );
	} );
} );
