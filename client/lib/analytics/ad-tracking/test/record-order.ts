/**
 * @jest-environment jsdom
 */
// @ts-nocheck - Test fixtures only include the fields used by this branch.
import { getCurrentUser } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { mayWeTrackByTracker } from 'calypso/lib/analytics/tracker-buckets';
import { TRACKING_IDS } from '../constants';
import { recordOrderInGoogleAds } from '../record-order';

jest.mock( '@automattic/calypso-analytics', () => ( {
	getCurrentUser: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/tracker-buckets', () => ( {
	mayWeTrackByTracker: jest.fn(),
	mayWeInitTracker: jest.fn(),
} ) );

jest.mock( '../load-tracking-scripts', () => ( {
	loadTrackingScripts: jest.fn(),
} ) );

jest.mock( '../setup', () => ( {} ) );

const cart = {
	total_cost: 19.99,
	currency: 'EUR',
};

const makeWpcomJetpackCartInfo = ( overrides = {} ) => ( {
	containsJetpackProducts: false,
	jetpackCost: 0,
	...overrides,
} );

describe( 'recordOrderInGoogleAds', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		window.gtag = jest.fn();
		config.isEnabled.mockReturnValue( false );
		mayWeTrackByTracker.mockReturnValue( true );
		getCurrentUser.mockReturnValue( {
			hashedPii: {
				email: 'hashed-email',
			},
		} );
	} );

	it( 'fires the old WP.com Google Ads purchase branch when the feature flag is disabled', () => {
		recordOrderInGoogleAds( cart, 12345, makeWpcomJetpackCartInfo() );

		expect( window.gtag ).toHaveBeenCalledWith( 'event', 'conversion', {
			send_to: TRACKING_IDS.wpcomGoogleAdsGtagPurchase,
			value: 19.99,
			currency: 'EUR',
			transaction_id: 12345,
		} );
	} );

	it( 'skips the old WP.com Google Ads purchase branch when the feature flag is enabled', () => {
		config.isEnabled.mockReturnValue( true );

		recordOrderInGoogleAds( cart, 12345, makeWpcomJetpackCartInfo() );

		expect( window.gtag ).not.toHaveBeenCalledWith(
			'event',
			'conversion',
			expect.objectContaining( {
				send_to: TRACKING_IDS.wpcomGoogleAdsGtagPurchase,
			} )
		);
	} );

	it( 'keeps the Jetpack Google Ads purchase branch when the feature flag is enabled', () => {
		config.isEnabled.mockReturnValue( true );

		recordOrderInGoogleAds(
			cart,
			12345,
			makeWpcomJetpackCartInfo( {
				containsJetpackProducts: true,
				jetpackCost: 5.67,
			} )
		);

		expect( window.gtag ).toHaveBeenCalledWith( 'set', 'user_data', {
			sha256_email_address: 'hashed-email',
		} );
		expect( window.gtag ).toHaveBeenCalledWith( 'event', 'conversion', {
			send_to: TRACKING_IDS.jetpackGoogleAdsGtagPurchase,
			value: 5.67,
			currency: 'EUR',
			transaction_id: 12345,
		} );
	} );
} );
