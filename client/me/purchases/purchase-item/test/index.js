/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { defaultI18n } from '@wordpress/i18n';
import i18n from 'i18n-calypso';
import MockDate from 'mockdate';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import PurchaseItem from '../';

// Expiry copy is measured in whole calendar days in the viewer's time zone, so
// these assertions only hold against a fixed clock.
const NOW = '2026-02-24T18:00:00Z';

describe( 'PurchaseItem', () => {
	beforeEach( () => {
		MockDate.set( NOW );
	} );

	afterEach( () => {
		MockDate.reset();
		// Both i18n libraries are module-level singletons, so translations added
		// by one test would otherwise change the copy every later test asserts on.
		i18n.setLocale();
		defaultI18n.resetLocaleData();
	} );

	describe( 'a purchase that expired earlier today', () => {
		const purchase = {
			product_slug: 'business-bundle',
			expiry_status: 'expired',
			subscription_status: 'active',
			expiry_date: '2026-02-24T08:00:00+00:00',
		};

		test( 'should be described as "Expired today"', () => {
			renderWithProvider( <PurchaseItem purchase={ purchase } /> );

			expect( screen.getByText( /expired today/i ) ).toBeInTheDocument();
		} );

		test( 'should be described with a translated label', () => {
			const translation = 'Vandaag verlopen';
			// The expiry copy comes from a helper shared with the dashboard, which
			// reads @wordpress/i18n. In the app `CalypsoI18nProvider` keeps the two
			// in step; nothing mounts it here, so both are set directly.
			i18n.addTranslations( { 'Expired today': [ translation ] } );
			defaultI18n.setLocaleData( { 'Expired today': [ translation ] } );

			renderWithProvider( <PurchaseItem purchase={ purchase } /> );

			expect( screen.getByText( translation ) ).toBeInTheDocument();
		} );
	} );

	describe( 'a purchase that expired on an earlier day', () => {
		const purchase = {
			product_slug: 'business-bundle',
			expiry_status: 'expired',
			subscription_status: 'active',
			expiry_date: '2026-02-21T08:00:00+00:00',
		};

		test( 'should be described with how long ago it expired', () => {
			renderWithProvider( <PurchaseItem purchase={ purchase } /> );

			expect( screen.getByText( /expired 3 days ago/i ) ).toBeInTheDocument();
		} );
	} );

	describe( 'a purchase that expires later today', () => {
		const purchase = {
			product_slug: 'business-bundle',
			expiry_status: 'manual-renew',
			subscription_status: 'active',
			expiry_date: '2026-02-24T23:00:00+00:00',
		};

		test( 'should be described as "Expires today" rather than a count of hours', () => {
			renderWithProvider( <PurchaseItem purchase={ purchase } /> );

			expect( screen.getByText( /expires today/i ) ).toBeInTheDocument();
			expect( screen.queryByText( /hours/i ) ).toBeNull();
		} );
	} );

	describe( 'a purchase past its expiry date that is still reported as expiring', () => {
		// The backend does not flip expiry_status the moment the date passes, so
		// this state is reachable for a while after expiry.
		const purchase = {
			product_slug: 'business-bundle',
			expiry_status: 'manual-renew',
			subscription_status: 'active',
			expiry_date: '2026-02-23T23:00:00+00:00',
		};

		test( 'should say "Expires today", never a past interval in a future sentence', () => {
			renderWithProvider( <PurchaseItem purchase={ purchase } /> );

			expect( screen.getByText( /expires today/i ) ).toBeInTheDocument();
			expect( screen.queryByText( /ago/i ) ).toBeNull();
		} );
	} );

	describe( 'a purchase removed before its expiry date', () => {
		const purchase = {
			product_slug: 'business-bundle',
			expiry_status: 'expired',
			subscription_status: 'inactive',
			expiry_date: '2026-02-27T23:00:00+00:00',
		};

		test( 'should not describe a future date as "Expired in N days"', () => {
			renderWithProvider( <PurchaseItem purchase={ purchase } /> );

			expect( screen.getByText( /expired today/i ) ).toBeInTheDocument();
			expect( screen.queryByText( /expired in/i ) ).toBeNull();
		} );
	} );

	describe( 'a purchase expiring soon', () => {
		const purchase = {
			product_slug: 'business-bundle',
			expiry_status: 'manual-renew',
			subscription_status: 'active',
			// Renders as February 27 in UTC, three calendar days out.
			expiry_date: '2026-02-27T23:00:00+00:00',
		};

		test( 'should count the same calendar days as the date it displays', () => {
			renderWithProvider( <PurchaseItem purchase={ purchase } /> );

			expect( screen.getByText( /expires in 3 days/i ) ).toHaveAttribute(
				'title',
				'February 27, 2026'
			);
		} );
	} );

	describe( 'a purchase expiring further out', () => {
		const purchase = {
			product_slug: 'business-bundle',
			expiry_status: 'manual-renew',
			subscription_status: 'active',
			// 45 days out, which the relative-date helpers would round to "1 month".
			expiry_date: '2026-04-10T12:00:00+00:00',
		};

		test( 'should count the days exactly rather than rounding to months', () => {
			renderWithProvider( <PurchaseItem purchase={ purchase } /> );

			expect( screen.getByText( /expires in 45 days/i ) ).toBeInTheDocument();
		} );
	} );

	describe( 'a purchase expiring beyond the warning window', () => {
		const purchase = {
			product_slug: 'business-bundle',
			expiry_status: 'manual-renew',
			subscription_status: 'active',
			// 90 days out.
			expiry_date: '2026-05-25T12:00:00+00:00',
		};

		test( 'should just say when it expires', () => {
			renderWithProvider( <PurchaseItem purchase={ purchase } /> );

			expect( screen.getByText( /expires on/i ) ).toBeInTheDocument();
			expect( screen.queryByText( /expires in/i ) ).toBeNull();
		} );
	} );

	describe( 'an in-app purchase', () => {
		const purchase = {
			is_iap_purchase: true,
			is_auto_renew_enabled: false,
			subscription_status: 'active',
		};

		test( 'should not display warning', () => {
			renderWithProvider( <PurchaseItem purchase={ purchase } /> );

			expect(
				screen.queryByText( 'You don’t have a payment method to renew this subscription' )
			).toBeNull();
		} );

		test( 'should display in-app purchase as the payment method', () => {
			renderWithProvider( <PurchaseItem purchase={ purchase } /> );
			expect( screen.getByText( 'In-App Purchase' ) ).toBeInTheDocument();
		} );
	} );

	test( 'should display "Add payment method" button if auto-renew is enabled but no payment method', () => {
		const purchase = {
			product_slug: 'business-bundle',
			is_auto_renew_enabled: true,
			subscription_status: 'active',
		};

		renderWithProvider( <PurchaseItem purchase={ purchase } /> );

		expect( screen.getByText( 'Add payment method' ) ).toBeInTheDocument();
	} );

	test( 'should not display warning if auto-renew is disabled with no payment method', () => {
		const purchase = {
			product_slug: 'business-bundle',
			is_auto_renew_enabled: false,
			subscription_status: 'active',
		};

		renderWithProvider( <PurchaseItem purchase={ purchase } /> );

		expect(
			screen.queryByText( 'You don’t have a payment method to renew this subscription' )
		).toBeNull();
	} );
} );
