/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import i18n from 'i18n-calypso';
import moment from 'moment';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import PurchaseItem from '../';

describe( 'PurchaseItem', () => {
	describe( 'a purchase that expired < 24 hours ago', () => {
		const purchase = {
			productSlug: 'business-bundle',
			expiryStatus: 'expired',
			expiryDate: moment().subtract( 10, 'hours' ).format(),
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

	describe( 'an in-app purchase', () => {
		const purchase = {
			isInAppPurchase: true,
			isAutoRenewEnabled: false,
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
		};

		renderWithProvider( <PurchaseItem purchase={ purchase } /> );

		expect( screen.getByText( 'Add payment method' ) ).toBeInTheDocument();
	} );

	test( 'should not display warning if auto-renew is disabled with no payment method', () => {
		const purchase = {
			productSlug: 'business-bundle',
			isAutoRenewEnabled: false,
		};

		renderWithProvider( <PurchaseItem purchase={ purchase } /> );

		expect(
			screen.queryByText( 'You don’t have a payment method to renew this subscription' )
		).toBeNull();
	} );
} );
