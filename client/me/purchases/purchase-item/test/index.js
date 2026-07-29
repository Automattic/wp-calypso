/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
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
		// i18n-calypso is a module-level singleton, so translations added by one
		// test would otherwise change the copy every later test asserts on.
		i18n.setLocale();
	} );

	describe( 'a purchase that expired earlier today', () => {
		const purchase = {
			productSlug: 'business-bundle',
			expiryStatus: 'expired',
			subscriptionStatus: 'active',
			expiryDate: '2026-02-24T08:00:00+00:00',
		};

		test( 'should be described as "Expired today"', () => {
			renderWithProvider( <PurchaseItem purchase={ purchase } /> );

			expect( screen.getByText( /expired today/i ) ).toBeInTheDocument();
		} );

		test( 'should be described with a translated label', () => {
			const translation = 'Vandaag verlopen';
			i18n.addTranslations( { 'Expired today': [ translation ] } );

			renderWithProvider( <PurchaseItem purchase={ purchase } /> );

			expect( screen.getByText( translation ) ).toBeInTheDocument();
		} );
	} );

	describe( 'a purchase that expired on an earlier day', () => {
		const purchase = {
			productSlug: 'business-bundle',
			expiryStatus: 'expired',
			subscriptionStatus: 'active',
			expiryDate: '2026-02-21T08:00:00+00:00',
		};

		test( 'should be described with how long ago it expired', () => {
			renderWithProvider( <PurchaseItem purchase={ purchase } /> );

			expect( screen.getByText( /expired 3 days ago/i ) ).toBeInTheDocument();
		} );
	} );

	describe( 'a purchase that expires later today', () => {
		const purchase = {
			productSlug: 'business-bundle',
			expiryStatus: 'manualRenew',
			subscriptionStatus: 'active',
			expiryDate: '2026-02-24T23:00:00+00:00',
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
			productSlug: 'business-bundle',
			expiryStatus: 'manualRenew',
			subscriptionStatus: 'active',
			expiryDate: '2026-02-23T23:00:00+00:00',
		};

		test( 'should say "Expires today", never a past interval in a future sentence', () => {
			renderWithProvider( <PurchaseItem purchase={ purchase } /> );

			expect( screen.getByText( /expires today/i ) ).toBeInTheDocument();
			expect( screen.queryByText( /ago/i ) ).toBeNull();
		} );
	} );

	describe( 'a purchase removed before its expiry date', () => {
		const purchase = {
			productSlug: 'business-bundle',
			expiryStatus: 'expired',
			subscriptionStatus: 'inactive',
			expiryDate: '2026-02-27T23:00:00+00:00',
		};

		test( 'should not describe a future date as "Expired in N days"', () => {
			renderWithProvider( <PurchaseItem purchase={ purchase } /> );

			expect( screen.getByText( /expired today/i ) ).toBeInTheDocument();
			expect( screen.queryByText( /expired in/i ) ).toBeNull();
		} );
	} );

	describe( 'a purchase expiring within the next 30 days', () => {
		const purchase = {
			productSlug: 'business-bundle',
			expiryStatus: 'manualRenew',
			subscriptionStatus: 'active',
			// Renders as February 27 in UTC, three calendar days out.
			expiryDate: '2026-02-27T23:00:00+00:00',
		};

		test( 'should count the same calendar days as the date it displays', () => {
			renderWithProvider( <PurchaseItem purchase={ purchase } /> );

			expect( screen.getByText( /expires in 3 days on/i ) ).toBeInTheDocument();
		} );
	} );

	describe( 'an in-app purchase', () => {
		const purchase = {
			isInAppPurchase: true,
			isAutoRenewEnabled: false,
			subscriptionStatus: 'active',
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
			productSlug: 'business-bundle',
			isAutoRenewEnabled: true,
			subscriptionStatus: 'active',
		};

		renderWithProvider( <PurchaseItem purchase={ purchase } /> );

		expect( screen.getByText( 'Add payment method' ) ).toBeInTheDocument();
	} );

	test( 'should not display warning if auto-renew is disabled with no payment method', () => {
		const purchase = {
			productSlug: 'business-bundle',
			isAutoRenewEnabled: false,
			subscriptionStatus: 'active',
		};

		renderWithProvider( <PurchaseItem purchase={ purchase } /> );

		expect(
			screen.queryByText( 'You don’t have a payment method to renew this subscription' )
		).toBeNull();
	} );
} );
