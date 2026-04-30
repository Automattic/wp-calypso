/**
 * @jest-environment jsdom
 */
// @ts-nocheck - Test fixtures only include the fields used by this module.
import { getCurrentUser } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { mayWeTrackByTracker } from 'calypso/lib/analytics/tracker-buckets';
import { TRACKING_IDS } from '../constants';
import { loadTrackingScripts } from '../load-tracking-scripts';
import { recordPostPurchaseTracking } from '../record-post-purchase';

jest.mock( '@automattic/calypso-analytics', () => ( {
	getCurrentUser: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/tracker-buckets', () => ( {
	mayWeTrackByTracker: jest.fn(),
} ) );

jest.mock( '../load-tracking-scripts', () => ( {
	loadTrackingScripts: jest.fn(),
} ) );

jest.mock( '../setup', () => ( {} ) );

const makeCart = ( overrides = {} ) => ( {
	total_cost: 12.34,
	currency: 'EUR',
	is_signup: false,
	products: [],
	...overrides,
} );

const makeReceipt = ( overrides = {} ) => ( {
	id: 12345,
	amount_integer: 6789,
	currency: 'GBP',
	items: [],
	...overrides,
} );

describe( 'recordPostPurchaseTracking', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		window.sessionStorage.clear();
		window.gtag = jest.fn();
		config.isEnabled.mockReturnValue( true );
		mayWeTrackByTracker.mockReturnValue( true );
		loadTrackingScripts.mockResolvedValue( [] );
		getCurrentUser.mockReturnValue( {
			hashedPii: {
				email: 'hashed-email',
			},
		} );
	} );

	it( 'does nothing when the feature flag is disabled', () => {
		config.isEnabled.mockReturnValue( false );

		recordPostPurchaseTracking( {
			receiptId: 1001,
			cart: makeCart(),
			source: 'checkout-pending',
		} );

		expect( window.gtag ).not.toHaveBeenCalled();
		expect( loadTrackingScripts ).not.toHaveBeenCalled();
	} );

	it( 'fires a Google Ads conversion when the feature flag is enabled', () => {
		recordPostPurchaseTracking( {
			receiptId: 1002,
			cart: makeCart(),
			source: 'checkout-pending',
		} );

		expect( loadTrackingScripts ).toHaveBeenCalled();
		expect( window.gtag ).toHaveBeenCalledWith( 'set', 'user_data', {
			sha256_email_address: 'hashed-email',
		} );
		expect( window.gtag ).toHaveBeenCalledWith( 'event', 'conversion', {
			send_to: TRACKING_IDS.wpcomGoogleAdsGtagPurchase,
			value: 12.34,
			currency: 'EUR',
			transaction_id: 1002,
		} );
	} );

	it( 'uses receipt value and currency when a receipt exists', () => {
		recordPostPurchaseTracking( {
			receiptId: 1003,
			receipt: makeReceipt( { id: 1003, amount_integer: 6789, currency: 'GBP' } ),
			cart: makeCart( { total_cost: 12.34, currency: 'EUR' } ),
			source: 'checkout-pending',
		} );

		expect( window.gtag ).toHaveBeenCalledWith( 'event', 'conversion', {
			send_to: TRACKING_IDS.wpcomGoogleAdsGtagPurchase,
			value: 67.89,
			currency: 'GBP',
			transaction_id: 1003,
		} );
	} );

	it( 'falls back to cart value and currency when no receipt exists', () => {
		recordPostPurchaseTracking( {
			receiptId: 1004,
			cart: makeCart( { total_cost: 23.45, currency: 'AUD' } ),
			source: 'checkout-pending',
		} );

		expect( window.gtag ).toHaveBeenCalledWith( 'event', 'conversion', {
			send_to: TRACKING_IDS.wpcomGoogleAdsGtagPurchase,
			value: 23.45,
			currency: 'AUD',
			transaction_id: 1004,
		} );
	} );

	it( 'uses the receipt id as transaction_id', () => {
		recordPostPurchaseTracking( {
			receiptId: 1005,
			cart: makeCart(),
			source: 'checkout-pending',
		} );

		expect( window.gtag ).toHaveBeenCalledWith(
			'event',
			'conversion',
			expect.objectContaining( {
				transaction_id: 1005,
			} )
		);
	} );

	it( 'does not convert WP.com Google Ads values to USD', () => {
		recordPostPurchaseTracking( {
			receiptId: 1006,
			cart: makeCart( { total_cost: 42.5, currency: 'JPY' } ),
			source: 'checkout-pending',
		} );

		expect( window.gtag ).toHaveBeenCalledWith(
			'event',
			'conversion',
			expect.objectContaining( {
				value: 42.5,
				currency: 'JPY',
			} )
		);
	} );

	it( 'skips when Google Ads tracking is disallowed', () => {
		mayWeTrackByTracker.mockReturnValue( false );

		recordPostPurchaseTracking( {
			receiptId: 1007,
			cart: makeCart(),
			source: 'checkout-pending',
		} );

		expect( window.gtag ).not.toHaveBeenCalled();
		expect( loadTrackingScripts ).not.toHaveBeenCalled();
	} );

	it( 'skips signup carts', () => {
		recordPostPurchaseTracking( {
			receiptId: 1008,
			receipt: makeReceipt( { id: 1008 } ),
			cart: makeCart( { is_signup: true } ),
			source: 'checkout-pending',
		} );

		expect( window.gtag ).not.toHaveBeenCalled();
	} );

	it( 'does not require a cart when receipt data is present', () => {
		recordPostPurchaseTracking( {
			receiptId: 1009,
			receipt: makeReceipt( { id: 1009, amount_integer: 2500, currency: 'USD' } ),
			source: 'checkout-pending',
		} );

		expect( window.gtag ).toHaveBeenCalledWith( 'event', 'conversion', {
			send_to: TRACKING_IDS.wpcomGoogleAdsGtagPurchase,
			value: 25,
			currency: 'USD',
			transaction_id: 1009,
		} );
	} );

	it( 'skips free purchases', () => {
		recordPostPurchaseTracking( {
			receiptId: 1010,
			receipt: makeReceipt( { id: 1010, amount_integer: 0, currency: 'USD' } ),
			cart: makeCart( { total_cost: 25 } ),
			source: 'checkout-pending',
		} );

		expect( window.gtag ).not.toHaveBeenCalled();
	} );

	it( 'dedupes by receipt id in memory', () => {
		recordPostPurchaseTracking( {
			receiptId: 1011,
			cart: makeCart(),
			source: 'checkout-pending',
		} );
		recordPostPurchaseTracking( {
			receiptId: 1011,
			cart: makeCart(),
			source: 'checkout-pending',
		} );

		expect( window.gtag ).toHaveBeenCalledTimes( 2 );
		expect( window.gtag ).toHaveBeenCalledWith(
			'event',
			'conversion',
			expect.objectContaining( {
				transaction_id: 1011,
			} )
		);
	} );

	it( 'continues when sessionStorage fails', () => {
		const getItemSpy = jest.spyOn( Storage.prototype, 'getItem' ).mockImplementation( () => {
			throw new Error( 'sessionStorage get failed' );
		} );
		const setItemSpy = jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
			throw new Error( 'sessionStorage set failed' );
		} );

		recordPostPurchaseTracking( {
			receiptId: 1012,
			cart: makeCart(),
			source: 'checkout-pending',
		} );

		expect( window.gtag ).toHaveBeenCalledWith(
			'event',
			'conversion',
			expect.objectContaining( {
				transaction_id: 1012,
			} )
		);

		getItemSpy.mockRestore();
		setItemSpy.mockRestore();
	} );

	it( 'never throws when tracking scripts or gtag fail', () => {
		loadTrackingScripts.mockImplementation( () => {
			throw new Error( 'script failure' );
		} );
		window.gtag.mockImplementation( () => {
			throw new Error( 'gtag failure' );
		} );

		expect( () =>
			recordPostPurchaseTracking( {
				receiptId: 1013,
				cart: makeCart(),
				source: 'checkout-pending',
			} )
		).not.toThrow();
	} );
} );
