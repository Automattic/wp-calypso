/**
 * @jest-environment jsdom
 */
import * as appRouterMe from 'calypso/dashboard/app/router/me';
import { isJetpackCloud } from 'calypso/dashboard/utils/jetpack';
import { getJetpackCloudExternalUrl } from '../router';

jest.mock( 'calypso/dashboard/utils/jetpack', () => ( {
	isJetpackCloud: jest.fn( () => false ),
} ) );

/**
 * Re-homing the three section routes moves their descendants too, and those
 * descendants derive their paths from the tree rather than from anything this
 * module spells out. Every link, redirect and `useParams()` call in
 * `client/dashboard/me/billing-purchases` reads these routes directly, so a
 * Dashboard-side rename would silently take the site-level URLs with it.
 */
describe( 'site-level purchases backport router', () => {
	it.each( [
		[ appRouterMe.purchaseSettingsRoute, '/purchases/subscriptions/$siteSlug/$purchaseId' ],
		[ appRouterMe.cancelPurchaseRoute, '/purchases/subscriptions/$siteSlug/$purchaseId/cancel' ],
		[
			appRouterMe.changePaymentMethodRoute,
			'/purchases/subscriptions/$siteSlug/$purchaseId/payment-method/change',
		],
		[
			appRouterMe.siteActionsRoute,
			'/purchases/subscriptions/$siteSlug/$purchaseId/site-actions/$action',
		],
		[ appRouterMe.receiptRoute, '/purchases/billing-history/$siteSlug/$receiptId' ],
		[ appRouterMe.addPaymentMethodRoute, '/purchases/payment-methods/$siteSlug/add' ],
	] )( 'serves %# at the site-level URL', ( route, expected ) => {
		expect( route.fullPath ).toBe( expected );
	} );
} );

describe( 'getJetpackCloudExternalUrl', () => {
	afterEach( () => {
		jest.mocked( isJetpackCloud ).mockReturnValue( false );
	} );

	it( 'leaves every path to page.js outside Jetpack Cloud', () => {
		expect( getJetpackCloudExternalUrl( '/sites/example.com' ) ).toBeUndefined();
	} );

	describe( 'on Jetpack Cloud', () => {
		beforeEach( () => {
			jest.mocked( isJetpackCloud ).mockReturnValue( true );
		} );

		it.each( [
			'/purchases',
			'/purchases/subscriptions/example.com',
			'/purchases/billing-history/example.com/123?foo=bar',
		] )( 'keeps %s in Jetpack Cloud', ( url ) => {
			expect( getJetpackCloudExternalUrl( url ) ).toBeUndefined();
		} );

		it.each( [
			'/sites/example.com',
			'/domains/example.com',
			'/emails',
			'/me/billing/tax-details',
			'/purchasesfoo',
		] )( 'sends %s to the WordPress.com Dashboard', ( url ) => {
			expect( getJetpackCloudExternalUrl( url ) ).toMatch(
				new RegExp( `^https?://my\\.(localhost:\\d+|wordpress\\.com)${ url }$` )
			);
		} );
	} );
} );
