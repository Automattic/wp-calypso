/**
 * @jest-environment jsdom
 */
// @ts-nocheck - Test fixtures only include the fields used by this helper.
import {
	isPostPurchaseWpcomGoogleAdsEnabled,
	recordPostPurchaseTracking,
} from 'calypso/lib/analytics/ad-tracking/record-post-purchase';
import { recordCheckoutPendingPostPurchaseTracking } from '../post-purchase-tracking';

jest.mock( 'calypso/lib/analytics/ad-tracking/record-post-purchase', () => ( {
	isPostPurchaseWpcomGoogleAdsEnabled: jest.fn(),
	recordPostPurchaseTracking: jest.fn(),
} ) );

const receipt = {
	id: 12345,
	amount_integer: 1500,
	currency: 'USD',
	items: [],
};

const cart = {
	total_cost: 15,
	currency: 'USD',
	products: [],
};

describe( 'recordCheckoutPendingPostPurchaseTracking', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		isPostPurchaseWpcomGoogleAdsEnabled.mockReturnValue( true );
	} );

	it( 'records post-purchase tracking for a successful order with a loaded receipt', () => {
		recordCheckoutPendingPostPurchaseTracking( {
			redirectInstructions: { url: '/checkout/thank-you/example.com/12345' },
			receiptId: 12345,
			receipt,
			cart,
		} );

		expect( recordPostPurchaseTracking ).toHaveBeenCalledWith( {
			receiptId: 12345,
			receipt,
			cart,
			source: 'checkout-pending',
		} );
	} );

	it( 'records post-purchase tracking for a receipt-only success path', () => {
		recordCheckoutPendingPostPurchaseTracking( {
			redirectInstructions: { url: '/checkout/thank-you/example.com/12345' },
			receiptId: 12345,
			receipt,
		} );

		expect( recordPostPurchaseTracking ).toHaveBeenCalledWith( {
			receiptId: 12345,
			receipt,
			cart: undefined,
			source: 'checkout-pending',
		} );
	} );

	it( 'does not record tracking without a successful receipt id', () => {
		recordCheckoutPendingPostPurchaseTracking( {
			redirectInstructions: { url: '/checkout/example.com' },
			receiptId: undefined,
			cart,
		} );

		expect( recordPostPurchaseTracking ).not.toHaveBeenCalled();
	} );

	it( 'does not record tracking for error, failure, or unknown redirect states', () => {
		recordCheckoutPendingPostPurchaseTracking( {
			redirectInstructions: { url: '/checkout/failed-purchases', isError: true },
			receiptId: 12345,
			receipt,
			cart,
		} );
		recordCheckoutPendingPostPurchaseTracking( {
			redirectInstructions: { url: '/checkout/example.com', isError: true },
			receiptId: 12346,
			receipt: { ...receipt, id: 12346 },
			cart,
		} );
		recordCheckoutPendingPostPurchaseTracking( {
			redirectInstructions: { url: '/checkout/example.com', isUnknown: true },
			receiptId: 12347,
			receipt: { ...receipt, id: 12347 },
			cart,
		} );

		expect( recordPostPurchaseTracking ).not.toHaveBeenCalled();
	} );

	it( 'does not record tracking when the feature flag is disabled', () => {
		isPostPurchaseWpcomGoogleAdsEnabled.mockReturnValue( false );

		recordCheckoutPendingPostPurchaseTracking( {
			redirectInstructions: { url: '/checkout/thank-you/example.com/12345' },
			receiptId: 12345,
			receipt,
			cart,
		} );

		expect( recordPostPurchaseTracking ).not.toHaveBeenCalled();
	} );

	it( 'does not throw when the tracker throws', () => {
		recordPostPurchaseTracking.mockImplementation( () => {
			throw new Error( 'tracker failed' );
		} );

		expect( () =>
			recordCheckoutPendingPostPurchaseTracking( {
				redirectInstructions: { url: '/checkout/thank-you/example.com/12345' },
				receiptId: 12345,
				receipt,
				cart,
			} )
		).not.toThrow();
	} );
} );
