import page from '@automattic/calypso-router';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { handleRenewNowClick } from '../index';

jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( '@automattic/calypso-router', () => jest.fn() );

describe( 'index', () => {
	beforeEach( () => {
		page.mockClear();
		recordTracksEvent.mockClear();
	} );

	describe( '#handleRenewNowClick', () => {
		const purchase = {
			ID: 1,
			currency_code: 'USD',
			expiry_date: '2020-05-20T00:00:00+00:00',
			product_slug: 'personal-bundle',
			product_name: 'Personal Plan',
			amount: 100,
		};
		const siteSlug = 'my-site.wordpress.com';

		test( 'should redirect to the checkout page', () => {
			const dispatch = jest.fn();
			handleRenewNowClick( purchase, siteSlug )( dispatch );
			expect( page ).toHaveBeenCalledWith( '/checkout/renew/1' );
		} );

		test( 'should redirect to the checkout page with ?redirect_to', () => {
			const dispatch = jest.fn();
			handleRenewNowClick( purchase, siteSlug, { redirectTo: '/me/purchases' } )( dispatch );
			expect( page ).toHaveBeenCalledWith( '/checkout/renew/1?redirect_to=%2Fme%2Fpurchases' );
		} );

		test( 'should send the tracks events', () => {
			const dispatch = jest.fn();
			const tracksProps = { extra: 'extra' };
			handleRenewNowClick( purchase, siteSlug, { tracksProps } )( dispatch );
			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_purchases_renew_now_click', {
				product_slug: 'personal-bundle',
				extra: 'extra',
			} );
		} );

		describe( 'when the purchase id does not exist', () => {
			test( 'should report error', () => {
				const dispatch = jest.fn();
				handleRenewNowClick( { ...purchase, ID: null }, siteSlug )( dispatch );
				expect( dispatch ).toHaveBeenCalledWith(
					expect.objectContaining( {
						notice: expect.objectContaining( {
							status: 'is-error',
							text: 'Could not find purchase id for renewal.',
						} ),
					} )
				);
			} );
		} );

		describe( 'when the product slug does not exist', () => {
			test( 'should report error', () => {
				const dispatch = jest.fn();
				handleRenewNowClick( { ...purchase, product_slug: '' }, siteSlug )( dispatch );
				expect( dispatch ).toHaveBeenCalledWith(
					expect.objectContaining( {
						notice: expect.objectContaining( {
							status: 'is-error',
							text: 'This product cannot be renewed.',
						} ),
					} )
				);
			} );
		} );
	} );

	describe( '#handleRenewNowClickSiteless', () => {
		const purchase = {
			ID: 1,
			currency_code: 'USD',
			expiry_date: '2020-05-20T00:00:00+00:00',
			product_slug: 'ak_plus_yearly_1',
			product_name: 'Akismet Plus',
			amount: 100,
		};

		// No site
		const siteSlug = '';

		test( 'should keep the service in the URL but drop the product slug', () => {
			const dispatch = jest.fn();
			handleRenewNowClick( purchase, siteSlug )( dispatch );
			expect( page ).toHaveBeenCalledWith( '/checkout/akismet/renew/1' );
		} );
	} );
} );
