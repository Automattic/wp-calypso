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

	test( 'should display warning if auto-renew is enabled but no payment method"', () => {
		const purchase = {
			productSlug: 'business-bundle',
			expiryDate: moment().subtract( 10, 'hours' ).format(),
			isAutoRenewEnabled: true,
		};

		renderWithProvider( <PurchaseItem purchase={ purchase } /> );

		expect( screen.getByText( 'No payment method' ) ).toBeInTheDocument();
	} );
} );
