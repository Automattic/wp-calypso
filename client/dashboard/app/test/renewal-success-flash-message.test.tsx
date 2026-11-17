/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import { dispatch, select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import nock from 'nock';
import { makePurchase } from '../../components/plan-expiry-notice/test/fixtures';
import { render } from '../../test-utils';
import { RenewalSuccessFlashMessage } from '../renewal-success-flash-message';
import Snackbars from '../snackbars';
import type { Purchase } from '@automattic/api-core';

const PURCHASE_ID = 1234;
const PURCHASE_PATH = `/me/billing/purchases/${ PURCHASE_ID }`;
const RENEWAL_FLASH_QUERY = `flash=renewal-success&renewed_purchase=${ PURCHASE_ID }`;
// The snackbar is also announced through the a11y speak region, which would make the text match twice.
const IGNORE_SPEAK_REGION = { ignore: '.a11y-speak-region, script, style' };

function mockPurchaseRequest( purchase: Purchase ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.2/upgrades/${ PURCHASE_ID }` )
		.query( true )
		.reply( 200, purchase );
}

function renderWithSnackbars() {
	return render(
		<>
			<RenewalSuccessFlashMessage />
			<Snackbars />
		</>
	);
}

describe( '<RenewalSuccessFlashMessage>', () => {
	afterEach( () => {
		select( noticesStore )
			.getNotices()
			.forEach( ( notice ) => dispatch( noticesStore ).removeNotice( notice.id ) );
		window.history.replaceState( {}, '', '/' );
	} );

	test( 'names the product and new expiry date, and mentions auto-renew when it is on', async () => {
		window.history.replaceState( {}, '', `${ PURCHASE_PATH }?${ RENEWAL_FLASH_QUERY }` );
		const scope = mockPurchaseRequest(
			makePurchase( {
				product_name: 'WordPress.com Business',
				expiry_date: '2027-06-01T12:00:00Z',
				is_auto_renew_enabled: true,
			} )
		);

		renderWithSnackbars();

		await waitFor( () =>
			expect(
				screen.getByText(
					'Success! You renewed WordPress.com Business Plan, and it is now paid through June 1, 2027. We will attempt to automatically renew it in the future.',
					IGNORE_SPEAK_REGION
				)
			).toBeVisible()
		);
		expect( screen.getByRole( 'link', { name: 'Learn more about renewals' } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/support/manage-purchases/automatic-renewal/'
		);
		expect( scope.isDone() ).toBe( true );
		expect( window.location.pathname ).toBe( PURCHASE_PATH );
		expect( window.location.search ).toBe( '' );
	} );

	test( 'leaves out the auto-renew sentence and link when auto-renew is off', async () => {
		window.history.replaceState( {}, '', `${ PURCHASE_PATH }?${ RENEWAL_FLASH_QUERY }` );
		mockPurchaseRequest(
			makePurchase( {
				product_name: 'WordPress.com Business',
				expiry_date: '2027-06-01T12:00:00Z',
				is_auto_renew_enabled: false,
			} )
		);

		renderWithSnackbars();

		await waitFor( () =>
			expect(
				screen.getByText(
					'Success! You renewed WordPress.com Business Plan, and it is now paid through June 1, 2027.',
					IGNORE_SPEAK_REGION
				)
			).toBeVisible()
		);
		expect(
			screen.queryByRole( 'link', { name: 'Learn more about renewals' } )
		).not.toBeInTheDocument();
	} );

	test( 'keeps other query params while clearing the flash params', async () => {
		window.history.replaceState( {}, '', `${ PURCHASE_PATH }?${ RENEWAL_FLASH_QUERY }&page=2` );
		mockPurchaseRequest( makePurchase() );

		renderWithSnackbars();

		await waitFor( () => expect( window.location.search ).toBe( '?page=2' ) );
	} );

	test( 'falls back to the generic purchase message when the purchase cannot be loaded', async () => {
		window.history.replaceState( {}, '', `${ PURCHASE_PATH }?${ RENEWAL_FLASH_QUERY }` );
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.2/upgrades/${ PURCHASE_ID }` )
			.query( true )
			.reply( 403, { error: 'authorization_required' } );

		renderWithSnackbars();

		await waitFor( () =>
			expect(
				screen.getByText( 'Your purchase was completed.', IGNORE_SPEAK_REGION )
			).toBeVisible()
		);
	} );

	test( 'does nothing without the renewal flash param', async () => {
		window.history.replaceState(
			{},
			'',
			`${ PURCHASE_PATH }?flash=checkout-success&renewed_purchase=${ PURCHASE_ID }`
		);
		const scope = mockPurchaseRequest( makePurchase() );

		renderWithSnackbars();

		await new Promise( ( resolve ) => setTimeout( resolve, 50 ) );
		expect( screen.queryByText( /You renewed/ ) ).not.toBeInTheDocument();
		expect( scope.isDone() ).toBe( false );
		expect( window.location.search ).toBe(
			`?flash=checkout-success&renewed_purchase=${ PURCHASE_ID }`
		);
	} );
} );
