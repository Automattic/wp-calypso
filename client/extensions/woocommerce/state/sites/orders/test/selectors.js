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
	getOrder,
	getOrders,
	getTotalOrders,
	isOrderLoaded,
	isOrderLoading,
	isOrderUpdating,
	getNewOrders,
	getNewOrdersRevenue,
} from '../selectors';
import orders from './fixtures/orders';
import order from './fixtures/order';
const additionalOrders = [ order ];

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
							35: true
						},
						isQueryLoading: {
							'{}': true,
						},
						isUpdating: {
							20: true,
						},
						items: {},
						queries: {},
						total: { '{}': 0 },
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
							35: false
						},
						isQueryLoading: {
							'{}': false,
						},
						isUpdating: {
							20: false,
						},
						items: keyBy( orders, 'id' ),
						queries: {
							'{}': [ 35, 26 ]
						},
						total: { '{}': 54 },
					}
				},
				321: {
					orders: {
						isQueryLoading: {
							'{}': false,
						},
						items: keyBy( [ ...orders, ...additionalOrders ], 'id' ),
					}
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

	describe( '#isOrderLoaded', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( isOrderLoaded( preInitializedState, 35, 123 ) ).to.be.false;
		} );

		it( 'should be false when this order is currently being fetched.', () => {
			expect( isOrderLoaded( loadingState, 35, 123 ) ).to.be.false;
		} );

		it( 'should be true when this order is loaded.', () => {
			expect( isOrderLoaded( loadedState, 35, 123 ) ).to.be.true;
		} );

		it( 'should be false when orders are loaded only for a different site.', () => {
			expect( isOrderLoaded( loadedState, 39, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( isOrderLoaded( loadedStateWithUi, 35 ) ).to.be.true;
		} );
	} );

	describe( '#isOrderLoading', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( isOrderLoading( preInitializedState, 35, 123 ) ).to.be.false;
		} );

		it( 'should be true when this order is currently being fetched.', () => {
			expect( isOrderLoading( loadingState, 35, 123 ) ).to.be.true;
		} );

		it( 'should be false when this order is loaded.', () => {
			expect( isOrderLoading( loadedState, 35, 123 ) ).to.be.false;
		} );

		it( 'should be false when orders are loaded only for a different site.', () => {
			expect( isOrderLoading( loadedState, 29, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( isOrderLoading( loadedStateWithUi, 35 ) ).to.be.false;
		} );
	} );

	describe( '#isOrderUpdating', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( isOrderUpdating( preInitializedState, 20, 123 ) ).to.be.false;
		} );

		it( 'should be true when this order is currently being updated.', () => {
			expect( isOrderUpdating( loadingState, 20, 123 ) ).to.be.true;
		} );

		it( 'should be false when this order is done updating.', () => {
			expect( isOrderUpdating( loadedState, 20, 123 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( isOrderUpdating( loadedStateWithUi, 20 ) ).to.be.false;
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

	describe( '#getTotalOrders', () => {
		it( 'should be 0 (default) when woocommerce state is not available.', () => {
			expect( getTotalOrders( preInitializedState, {}, 123 ) ).to.eql( 0 );
		} );

		it( 'should be 0 (default) when orders are loading.', () => {
			expect( getTotalOrders( loadingState, {}, 123 ) ).to.eql( 0 );
		} );

		it( 'should be 54, the set total, if the orders are loaded.', () => {
			expect( getTotalOrders( loadedState, {}, 123 ) ).to.eql( 54 );
		} );

		it( 'should be 0 (default) when orders are loaded only for a different site.', () => {
			expect( getTotalOrders( loadedState, {}, 456 ) ).to.eql( 0 );
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getTotalOrders( loadedStateWithUi ) ).to.eql( 54 );
		} );
	} );

	describe( '#getOrder', () => {
		it( 'should be null when woocommerce state is not available.', () => {
			expect( getOrder( preInitializedState, 35, 123 ) ).to.be.null;
		} );

		it( 'should be null when orders are loading.', () => {
			expect( getOrder( loadingState, 35, 123 ) ).to.be.null;
		} );

		it( 'should be the order object if it is loaded.', () => {
			expect( getOrder( loadedState, 35, 123 ) ).to.eql( orders[ 0 ] );
		} );

		it( 'should be null when orders are loaded only for a different site.', () => {
			expect( getOrder( loadedState, 23, 456 ) ).to.be.null;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getOrder( loadedStateWithUi, 26 ) ).to.eql( orders[ 1 ] );
		} );
	} );

	describe( '#getNewOrders', () => {
		it( 'should be an empty array when woocommerce state is not available.', () => {
			expect( getNewOrders( preInitializedState, 123 ) ).to.be.empty;
		} );

		it( 'should be an empty array when orders are loading.', () => {
			expect( getNewOrders( loadingState, 123 ) ).to.be.empty;
		} );

		it( 'should return the list of new orders only', () => {
			expect( getNewOrders( loadedState, 321 ) ).to.have.members( orders );
			expect( getNewOrders( loadedState, 321 ) ).to.not.have.members( additionalOrders );
		} );

		it( 'should be an empty array when orders are loaded only for a different site.', () => {
			expect( getNewOrders( loadedState, 456 ) ).to.be.empty;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getNewOrders( loadedState, 321 ) ).to.have.members( orders );
			expect( getNewOrders( loadedState, 321 ) ).to.not.have.members( additionalOrders );
		} );
	} );

	describe( '#getNewOrdersRevenue', () => {
		it( 'should be 0 when woocommerce state is not available.', () => {
			expect( getNewOrdersRevenue( preInitializedState, 123 ) ).to.eql( 0 );
		} );

		it( 'should be 0 when orders are loading.', () => {
			expect( getNewOrdersRevenue( loadingState, 123 ) ).to.eql( 0 );
		} );

		it( 'should return the total of new orders only', () => {
			expect( getNewOrdersRevenue( loadedState, 321 ) ).to.eql( 30.00 );
		} );

		it( 'should be 0 when orders are loaded only for a different site.', () => {
			expect( getNewOrdersRevenue( loadedState, 456 ) ).to.eql( 0 );
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getNewOrdersRevenue( loadedState, 321 ) ).to.eql( 30.00 );
		} );
	} );
} );
