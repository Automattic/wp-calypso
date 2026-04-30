/**
 * @jest-environment jsdom
 */
// @ts-nocheck - Test fixtures only include the fields used by this helper.
import {
	isPostPurchaseWpcomGoogleAdsEnabled,
	recordPostPurchaseTracking,
} from 'calypso/lib/analytics/ad-tracking/record-post-purchase';
import { recordOneClickModalPostPurchaseTracking } from '../hooks/use-create-payment-submitted-and-processing-callback';

jest.mock( 'calypso/lib/analytics/ad-tracking/record-post-purchase', () => ( {
	isPostPurchaseWpcomGoogleAdsEnabled: jest.fn(),
	recordPostPurchaseTracking: jest.fn(),
} ) );

const cart = {
	total_cost: 19.99,
	currency: 'USD',
	products: [],
};

const successfulTransaction = {
	success: true,
	receipt_id: 12345,
	purchases: {},
	failed_purchases: {},
};

describe( 'recordOneClickModalPostPurchaseTracking', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		isPostPurchaseWpcomGoogleAdsEnabled.mockReturnValue( true );
	} );

	it( 'records post-purchase tracking for successful no-pending modal transactions', () => {
		recordOneClickModalPostPurchaseTracking( {
			disabledThankYouPage: true,
			isInModal: true,
			responseCart: cart,
			transactionResult: successfulTransaction,
		} );

		expect( recordPostPurchaseTracking ).toHaveBeenCalledWith( {
			receiptId: 12345,
			cart,
			source: 'one-click-modal',
		} );
	} );

	it( 'does not record tracking when the feature flag is disabled', () => {
		isPostPurchaseWpcomGoogleAdsEnabled.mockReturnValue( false );

		recordOneClickModalPostPurchaseTracking( {
			disabledThankYouPage: true,
			isInModal: true,
			responseCart: cart,
			transactionResult: successfulTransaction,
		} );

		expect( recordPostPurchaseTracking ).not.toHaveBeenCalled();
	} );

	it( 'does not record tracking for failed transactions', () => {
		recordOneClickModalPostPurchaseTracking( {
			disabledThankYouPage: true,
			isInModal: true,
			responseCart: cart,
			transactionResult: {
				...successfulTransaction,
				success: false,
			},
		} );

		expect( recordPostPurchaseTracking ).not.toHaveBeenCalled();
	} );

	it( 'does not record tracking outside the modal no-pending path', () => {
		recordOneClickModalPostPurchaseTracking( {
			disabledThankYouPage: true,
			isInModal: false,
			responseCart: cart,
			transactionResult: successfulTransaction,
		} );
		recordOneClickModalPostPurchaseTracking( {
			disabledThankYouPage: false,
			isInModal: true,
			responseCart: cart,
			transactionResult: successfulTransaction,
		} );

		expect( recordPostPurchaseTracking ).not.toHaveBeenCalled();
	} );

	it( 'does not record tracking for ecommerce carts because pending handles them', () => {
		recordOneClickModalPostPurchaseTracking( {
			disabledThankYouPage: true,
			isInModal: true,
			responseCart: {
				...cart,
				products: [ { product_slug: 'ecommerce-bundle' } ],
			},
			transactionResult: successfulTransaction,
		} );

		expect( recordPostPurchaseTracking ).not.toHaveBeenCalled();
	} );

	it( 'does not record tracking without a receipt id', () => {
		recordOneClickModalPostPurchaseTracking( {
			disabledThankYouPage: true,
			isInModal: true,
			responseCart: cart,
			transactionResult: {
				...successfulTransaction,
				receipt_id: 0,
			},
		} );

		expect( recordPostPurchaseTracking ).not.toHaveBeenCalled();
	} );

	it( 'does not throw when the tracker throws', () => {
		recordPostPurchaseTracking.mockImplementation( () => {
			throw new Error( 'tracker failed' );
		} );

		expect( () =>
			recordOneClickModalPostPurchaseTracking( {
				disabledThankYouPage: true,
				isInModal: true,
				responseCart: cart,
				transactionResult: successfulTransaction,
			} )
		).not.toThrow();
	} );
} );
