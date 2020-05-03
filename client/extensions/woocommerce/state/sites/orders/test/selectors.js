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
	getNewOrdersWithoutPayPalPendingRevenue,
	getNewOrdersWithoutPayPalPending,
} from '../selectors';
import order from './fixtures/order';
import orders from './fixtures/orders';
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
							35: true,
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
							35: false,
						},
						isQueryLoading: {
							'{}': false,
						},
						isUpdating: {
							20: false,
						},
						items: keyBy( orders, 'id' ),
						queries: {
							'{}': [ 35, 26 ],
						},
						total: { '{}': 54 },
					},
				},
				321: {
					orders: {
						isQueryLoading: {
							'{}': false,
						},
						items: keyBy( [ ...orders, ...additionalOrders ], 'id' ),
					},
				},
			},
		},
	},
};

const paypalPendingOrder = [
	{
		id: 40,
		status: 'pending',
		currency: 'USD',
		total: '50.87',
		total_tax: '0.00',
		prices_include_tax: false,
		billing: {},
		shipping: {},
		payment_method: 'paypal',
		payment_method_title: 'PayPal',
		meta_data: [],
		line_items: [
			{
				id: 12,
				name: 'Coffee',
				price: 15.29,
			},
		],
		tax_lines: [],
		shipping_lines: [
			{
				id: 13,
				method_title: 'Flat rate',
				method_id: 'flat_rate:2',
				total: '5.00',
				total_tax: '0.00',
				taxes: [],
			},
		],
	},
];

const loadedStatePayPal = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					orders: {
						isLoading: {
							35: false,
						},
						isQueryLoading: {
							'{}': false,
						},
						isUpdating: {
							20: false,
						},
						items: keyBy( orders, 'id' ),
						queries: {
							'{}': [ 35, 26 ],
						},
						total: { '{}': 54 },
					},
				},
				321: {
					orders: {
						isQueryLoading: {
							'{}': false,
						},
						items: keyBy( [ ...orders, ...paypalPendingOrder ], 'id' ),
					},
				},
			},
		},
	},
};

const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#areOrdersLoaded', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( areOrdersLoaded( preInitializedState, 1, 123 ) ).to.be.false;
		} );

		test( 'should be false when orders are currently being fetched.', () => {
			expect( areOrdersLoaded( loadingState, 1, 123 ) ).to.be.false;
		} );

		test( 'should be true when orders are loaded.', () => {
			expect( areOrdersLoaded( loadedState, 1, 123 ) ).to.be.true;
		} );

		test( 'should be false when orders are loaded only for a different site.', () => {
			expect( areOrdersLoaded( loadedState, 1, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areOrdersLoaded( loadedStateWithUi, 1 ) ).to.be.true;
		} );
	} );

	describe( '#areOrdersLoading', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( areOrdersLoading( preInitializedState, 1, 123 ) ).to.be.false;
		} );

		test( 'should be true when orders are currently being fetched.', () => {
			expect( areOrdersLoading( loadingState, 1, 123 ) ).to.be.true;
		} );

		test( 'should be false when orders are loaded.', () => {
			expect( areOrdersLoading( loadedState, 1, 123 ) ).to.be.false;
		} );

		test( 'should be false when orders are loaded only for a different site.', () => {
			expect( areOrdersLoading( loadedState, 1, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areOrdersLoading( loadedStateWithUi, 1 ) ).to.be.false;
		} );
	} );

	describe( '#isOrderLoaded', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( isOrderLoaded( preInitializedState, 35, 123 ) ).to.be.false;
		} );

		test( 'should be false when this order is currently being fetched.', () => {
			expect( isOrderLoaded( loadingState, 35, 123 ) ).to.be.false;
		} );

		test( 'should be true when this order is loaded.', () => {
			expect( isOrderLoaded( loadedState, 35, 123 ) ).to.be.true;
		} );

		test( 'should be false when orders are loaded only for a different site.', () => {
			expect( isOrderLoaded( loadedState, 39, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( isOrderLoaded( loadedStateWithUi, 35 ) ).to.be.true;
		} );
	} );

	describe( '#isOrderLoading', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( isOrderLoading( preInitializedState, 35, 123 ) ).to.be.false;
		} );

		test( 'should be true when this order is currently being fetched.', () => {
			expect( isOrderLoading( loadingState, 35, 123 ) ).to.be.true;
		} );

		test( 'should be false when this order is loaded.', () => {
			expect( isOrderLoading( loadedState, 35, 123 ) ).to.be.false;
		} );

		test( 'should be false when orders are loaded only for a different site.', () => {
			expect( isOrderLoading( loadedState, 29, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( isOrderLoading( loadedStateWithUi, 35 ) ).to.be.false;
		} );
	} );

	describe( '#isOrderUpdating', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( isOrderUpdating( preInitializedState, 20, 123 ) ).to.be.false;
		} );

		test( 'should be true when this order is currently being updated.', () => {
			expect( isOrderUpdating( loadingState, 20, 123 ) ).to.be.true;
		} );

		test( 'should be false when this order is done updating.', () => {
			expect( isOrderUpdating( loadedState, 20, 123 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( isOrderUpdating( loadedStateWithUi, 20 ) ).to.be.false;
		} );
	} );

	describe( '#getOrders', () => {
		test( 'should be an empty array when woocommerce state is not available.', () => {
			expect( getOrders( preInitializedState, 1, 123 ) ).to.be.empty;
		} );

		test( 'should be an empty array when orders are loading.', () => {
			expect( getOrders( loadingState, 1, 123 ) ).to.be.empty;
		} );

		test( 'should be the list of orders if they are loaded.', () => {
			expect( getOrders( loadedState, 1, 123 ) ).to.eql( orders );
		} );

		test( 'should be an empty array when orders are loaded only for a different site.', () => {
			expect( getOrders( loadedState, 1, 456 ) ).to.be.empty;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getOrders( loadedStateWithUi, 1 ) ).to.eql( orders );
		} );
	} );

	describe( '#getTotalOrders', () => {
		test( 'should be 0 (default) when woocommerce state is not available.', () => {
			expect( getTotalOrders( preInitializedState, {}, 123 ) ).to.eql( 0 );
		} );

		test( 'should be 0 (default) when orders are loading.', () => {
			expect( getTotalOrders( loadingState, {}, 123 ) ).to.eql( 0 );
		} );

		test( 'should be 54, the set total, if the orders are loaded.', () => {
			expect( getTotalOrders( loadedState, {}, 123 ) ).to.eql( 54 );
		} );

		test( 'should be 0 (default) when orders are loaded only for a different site.', () => {
			expect( getTotalOrders( loadedState, {}, 456 ) ).to.eql( 0 );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getTotalOrders( loadedStateWithUi ) ).to.eql( 54 );
		} );
	} );

	describe( '#getOrder', () => {
		test( 'should be null when woocommerce state is not available.', () => {
			expect( getOrder( preInitializedState, 35, 123 ) ).to.be.null;
		} );

		test( 'should be null when orders are loading.', () => {
			expect( getOrder( loadingState, 35, 123 ) ).to.be.null;
		} );

		test( 'should be the order object if it is loaded.', () => {
			expect( getOrder( loadedState, 35, 123 ) ).to.eql( orders[ 0 ] );
		} );

		test( 'should be null when orders are loaded only for a different site.', () => {
			expect( getOrder( loadedState, 23, 456 ) ).to.be.null;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getOrder( loadedStateWithUi, 26 ) ).to.eql( orders[ 1 ] );
		} );
	} );

	describe( '#getNewOrders', () => {
		test( 'should be an empty array when woocommerce state is not available.', () => {
			expect( getNewOrders( preInitializedState, 123 ) ).to.be.empty;
		} );

		test( 'should be an empty array when orders are loading.', () => {
			expect( getNewOrders( loadingState, 123 ) ).to.be.empty;
		} );

		test( 'should return the list of new orders only', () => {
			expect( getNewOrders( loadedState, 321 ) ).to.have.members( orders );
			expect( getNewOrders( loadedState, 321 ) ).to.not.have.members( additionalOrders );
		} );

		test( 'should be an empty array when orders are loaded only for a different site.', () => {
			expect( getNewOrders( loadedState, 456 ) ).to.be.empty;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getNewOrders( loadedState, 321 ) ).to.have.members( orders );
			expect( getNewOrders( loadedState, 321 ) ).to.not.have.members( additionalOrders );
		} );
	} );

	describe( '#getNewOrdersRevenue', () => {
		test( 'should be 0 when woocommerce state is not available.', () => {
			expect( getNewOrdersRevenue( preInitializedState, 123 ) ).to.eql( 0 );
		} );

		test( 'should be 0 when orders are loading.', () => {
			expect( getNewOrdersRevenue( loadingState, 123 ) ).to.eql( 0 );
		} );

		test( 'should return the total of new orders only', () => {
			expect( getNewOrdersRevenue( loadedState, 321 ) ).to.eql( 30.0 );
		} );

		test( 'should be 0 when orders are loaded only for a different site.', () => {
			expect( getNewOrdersRevenue( loadedState, 456 ) ).to.eql( 0 );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getNewOrdersRevenue( loadedState, 321 ) ).to.eql( 30.0 );
		} );
	} );

	describe( '#getNewOrdersWithoutPayPalPending', () => {
		it( 'should return an empty array when no data is available', () => {
			expect( getNewOrdersWithoutPayPalPending( preInitializedState, 123 ) ).to.eql( [] );
		} );

		it( 'should return an array with proper new order data', () => {
			expect( getNewOrdersWithoutPayPalPending( loadedState, 321 ) ).to.have.members( orders );
		} );

		it( 'should not return PayPal payment orders that are pending', () => {
			expect( getNewOrdersWithoutPayPalPending( loadedStatePayPal, 321 ) ).to.have.members(
				orders
			);
			expect( getNewOrdersWithoutPayPalPending( loadedStatePayPal, 321 ) ).to.not.have.members(
				paypalPendingOrder
			);
		} );
	} );

	describe( '#getNewOrdersWithoutPayPalPendingRevenue', () => {
		it( 'should be 0 when woocommerce state is not available.', () => {
			expect( getNewOrdersWithoutPayPalPendingRevenue( preInitializedState, 123 ) ).to.eql( 0 );
		} );

		it( 'should be 0 when orders are loading.', () => {
			expect( getNewOrdersWithoutPayPalPendingRevenue( loadingState, 123 ) ).to.eql( 0 );
		} );

		it( 'should return the total of new orders only', () => {
			expect( getNewOrdersWithoutPayPalPendingRevenue( loadedStatePayPal, 321 ) ).to.eql( 30.0 );
		} );

		it( 'should be 0 when orders are loaded only for a different site.', () => {
			expect( getNewOrdersWithoutPayPalPendingRevenue( loadedState, 456 ) ).to.eql( 0 );
		} );

		it( 'should get the siteId from the UI tree if not provided and not include PayPal Pending Order.', () => {
			expect( getNewOrdersWithoutPayPalPendingRevenue( loadedStatePayPal, 321 ) ).to.eql( 30.0 );
		} );
	} );
} );
