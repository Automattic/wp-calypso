/**
 * This is required to prevent "ReferenceError: window is not defined"
 *
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { getThankYouPageUrl } from '../use-get-thank-you-url';
import { isEnabled } from 'config';

let mockGSuiteCountryIsValid = true;
jest.mock( 'lib/user', () =>
	jest.fn( () => ( {
		get: () => ( { is_valid_google_apps_country: mockGSuiteCountryIsValid } ),
	} ) )
);

jest.mock( 'config', () => {
	const mock = () => 'development';
	mock.isEnabled = jest.fn();
	return mock;
} );

// Temporary A/B test to dial down the concierge upsell, check pau2Xa-1bk-p2.
jest.mock( 'lib/abtest', () => ( {
	abtest: jest.fn( () => {
		return 'offer';
	} ),
} ) );

const defaultArgs = {
	getUrlFromCookie: jest.fn( () => null ),
	saveUrlToCookie: jest.fn(),
};

describe( 'getThankYouPageUrl', () => {
	it( 'redirects to the root page when no site is set', () => {
		const url = getThankYouPageUrl( defaultArgs );
		expect( url ).toBe( '/' );
	} );

	it( 'redirects to the thank-you page with a purchase id when a site and purchaseId is set', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: '1234abcd',
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/1234abcd' );
	} );

	it( 'redirects to the thank-you page with a receipt id when a site and receiptId is set', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			receiptId: '1234abcd',
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/1234abcd' );
	} );

	it( 'redirects to the thank-you pending page with a order id when a site and orderId is set', () => {
		const url = getThankYouPageUrl( { ...defaultArgs, siteSlug: 'foo.bar', orderId: '1234abcd' } );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/pending/1234abcd' );
	} );

	it( 'redirects to the thank-you page with a placeholder receiptId with a site when the cart is not empty but there is no receipt id', () => {
		const cart = { products: [ { id: 'something' } ] };
		const url = getThankYouPageUrl( { ...defaultArgs, siteSlug: 'foo.bar', cart } );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/:receiptId' );
	} );

	it( 'redirects to the thank-you page with a feature when a site, a purchase id, and a valid feature is set', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			feature: 'all-free-features',
			purchaseId: '1234abcd',
		} );
		expect( url ).toBe( '/checkout/thank-you/features/all-free-features/foo.bar/1234abcd' );
	} );

	it( 'redirects to the thank-you page with a feature when a site, a receipt id, and a valid feature is set', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			feature: 'all-free-features',
			receiptId: '1234abcd',
		} );
		expect( url ).toBe( '/checkout/thank-you/features/all-free-features/foo.bar/1234abcd' );
	} );

	it( 'redirects to the thank-you pending page with a feature when a site, an order id, and a valid feature is set', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			feature: 'all-free-features',
			orderId: '1234abcd',
		} );
		expect( url ).toBe( '/checkout/thank-you/features/all-free-features/foo.bar/pending/1234abcd' );
	} );

	it( 'redirects to the thank-you page with a feature when a site and a valid feature is set with no receipt but the cart is not empty', () => {
		const cart = { products: [ { id: 'something' } ] };
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			feature: 'all-free-features',
			cart,
		} );
		expect( url ).toBe( '/checkout/thank-you/features/all-free-features/foo.bar/:receiptId' );
	} );

	it( 'redirects to the thank-you page without a feature when a site, a purchase id, and an invalid feature is set', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			feature: 'fake-key',
			purchaseId: '1234abcd',
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/1234abcd' );
	} );

	it( 'redirects to the plans page with thank-you query string if there is a non-atomic jetpack product', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: '1234abcd',
			isJetpackNotAtomic: true,
			product: 'jetpack_backup_daily',
		} );
		expect( url ).toBe( '/plans/my-plan/foo.bar?thank-you=true&product=jetpack_backup_daily' );
	} );

	it( 'redirects to the plans page with thank-you query string and jetpack onboarding if there is a non-atomic jetpack plan', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: '1234abcd',
			isJetpackNotAtomic: true,
		} );
		expect( url ).toBe( '/plans/my-plan/foo.bar?thank-you=true&install=all' );
	} );

	it( 'redirects to the plans page with thank-you query string and jetpack onboarding if there is a non-atomic jetpack plan even if there is a feature', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: '1234abcd',
			feature: 'all-free-features',
			isJetpackNotAtomic: true,
		} );
		expect( url ).toBe( '/plans/my-plan/foo.bar?thank-you=true&install=all' );
	} );

	it( 'redirects to internal redirectTo url if set', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			redirectTo: '/foo/bar',
		} );
		expect( url ).toBe( '/foo/bar' );
	} );

	it( 'redirects to the default url if redirectTo does not start with admin_url for site', () => {
		const adminUrl = 'https://my.site/wp-admin/';
		const redirectTo = 'https://other.site/post.php?post=515';
		const url = getThankYouPageUrl( { ...defaultArgs, siteSlug: 'foo.bar', adminUrl, redirectTo } );
		expect( url ).toBe( '/checkout/thank-you/foo.bar' );
	} );

	it( 'redirects to external redirectTo url if it starts with admin_url for site', () => {
		const adminUrl = 'https://my.site/wp-admin/';
		const redirectTo = adminUrl + 'post.php?post=515';
		const url = getThankYouPageUrl( { ...defaultArgs, siteSlug: 'foo.bar', adminUrl, redirectTo } );
		expect( url ).toBe( redirectTo + '&action=edit&plan_upgraded=1' );
	} );

	it( 'redirects to manage purchase page if there is a renewal', () => {
		const cart = {
			products: [
				{ extra: { purchaseType: 'renewal', purchaseDomain: 'foo.bar', purchaseId: '123abc' } },
			],
		};
		const url = getThankYouPageUrl( { ...defaultArgs, siteSlug: 'foo.bar', cart } );
		expect( url ).toBe( '/me/purchases/foo.bar/123abc' );
	} );

	it( 'does not redirect to url from cookie if isEligibleForSignupDestination is false', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		const cart = {
			products: [ { product_slug: 'foo' } ],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			getUrlFromCookie,
			isEligibleForSignupDestination: false,
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/:receiptId' );
	} );

	it( 'redirects to url from cookie if isEligibleForSignupDestination is set', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		const cart = {
			products: [ { product_slug: 'foo' } ],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			getUrlFromCookie,
			isEligibleForSignupDestinationResult: true,
		} );
		expect( url ).toBe( '/cookie' );
	} );

	it( 'redirects to url from cookie if cart is empty and no receipt is set', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		const cart = {
			products: [],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			getUrlFromCookie,
			isEligibleForSignupDestination: true,
		} );
		expect( url ).toBe( '/cookie' );
	} );

	it( 'redirects to url from cookie followed by purchase id if create_new_blog is set', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		const cart = {
			create_new_blog: true,
			products: [ { id: '123' } ],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			getUrlFromCookie,
			purchaseId: '1234abcd',
		} );
		expect( url ).toBe( '/cookie/1234abcd' );
	} );

	it( 'redirects to url from cookie followed by receipt id if create_new_blog is set', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		const cart = {
			create_new_blog: true,
			products: [ { id: '123' } ],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: '1234abcd',
			getUrlFromCookie,
		} );
		expect( url ).toBe( '/cookie/1234abcd' );
	} );

	it( 'redirects to url from cookie followed by pending order id if create_new_blog is set', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		const cart = {
			create_new_blog: true,
			products: [ { id: '123' } ],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			orderId: '1234abcd',
			getUrlFromCookie,
		} );
		expect( url ).toBe( '/cookie/pending/1234abcd' );
	} );

	it( 'redirects to url from cookie followed by placeholder receiptId if create_new_blog is set and there is no receipt', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		const cart = {
			create_new_blog: true,
			products: [ { id: '123' } ],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			getUrlFromCookie,
		} );
		expect( url ).toBe( '/cookie/:receiptId' );
	} );

	// Note: This just verifies the existing behavior; I suspect this is a bug
	it( 'redirects to thank-you page followed by placeholder receiptId twice if no cookie url is set, create_new_blog is set, and there is no receipt', () => {
		const cart = {
			create_new_blog: true,
			products: [ { id: '123' } ],
		};
		const url = getThankYouPageUrl( { ...defaultArgs, siteSlug: 'foo.bar', cart } );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/:receiptId/:receiptId' );
	} );

	// Note: This just verifies the existing behavior; I suspect this is a bug
	it( 'redirects to thank-you page followed by purchase id twice if no cookie url is set, create_new_blog is set, and there is no receipt', () => {
		const cart = {
			create_new_blog: true,
			products: [ { id: '123' } ],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: '1234abcd',
			cart,
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/1234abcd/1234abcd' );
	} );

	it( 'redirects to thank-you page for a new site with a domain and some failed purchases', () => {
		const cart = {
			products: [
				{
					product_slug: 'some_domain',
					is_domain_registration: true,
					extra: { context: 'signup' },
					meta: 'my.site',
				},
			],
		};
		mockGSuiteCountryIsValid = true;
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: '1234abcd',
			didPurchaseFail: true,
			isNewlyCreatedSite: true,
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/1234abcd' );
	} );

	it( 'redirects to thank-you page for a new site (via isNewlyCreatedSite) without a domain', () => {
		const cart = {
			products: [
				{
					product_slug: 'some_domain',
					is_domain_registration: false,
					extra: { context: 'signup' },
					meta: 'my.site',
				},
			],
		};
		mockGSuiteCountryIsValid = false;
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: '1234abcd',
			isNewlyCreatedSite: true,
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/1234abcd' );
	} );

	it( 'redirects to thank-you page (with concierge display mode) for a new site with a domain and no failed purchases but concierge is in the cart', () => {
		const cart = {
			products: [
				{ product_slug: 'concierge-session' },
				{
					product_slug: 'some_domain',
					is_domain_registration: true,
					extra: { context: 'signup' },
					meta: 'my.site',
				},
			],
		};
		mockGSuiteCountryIsValid = false;
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: '1234abcd',
			isNewlyCreatedSite: true,
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/1234abcd?d=concierge' );
	} );

	it( 'redirects to thank-you page for a new site with a domain and no failed purchases but neither GSuite nor concierge are in the cart if user is in invalid country', () => {
		const cart = {
			products: [
				{
					product_slug: 'some_domain',
					is_domain_registration: true,
					extra: { context: 'signup' },
					meta: 'my.site',
				},
			],
		};
		mockGSuiteCountryIsValid = false;
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: '1234abcd',
			isNewlyCreatedSite: true,
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/1234abcd' );
	} );

	// We are temporarily disabling the premium bump offer, so skipping this test for now. Check pNEWy-cIg-p2.
	it.skip( 'redirects to premium upgrade nudge if concierge and jetpack are not in the cart, personal is in the cart, and the previous route is not the nudge', () => {
		isEnabled.mockImplementation( ( flag ) => flag === 'upsell/concierge-session' );
		const cart = {
			products: [
				{
					product_slug: 'personal-bundle',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: '1234abcd',
		} );
		expect( url ).toBe( '/checkout/foo.bar/offer-plan-upgrade/premium/1234abcd' );
	} );

	it( 'redirects to concierge nudge if concierge and jetpack are not in the cart, blogger is in the cart, and the previous route is not the nudge', () => {
		isEnabled.mockImplementation( ( flag ) => flag === 'upsell/concierge-session' );
		const cart = {
			products: [
				{
					product_slug: 'blogger-bundle',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: '1234abcd',
		} );
		expect( url ).toBe( '/checkout/offer-quickstart-session/1234abcd/foo.bar' );
	} );

	it( 'redirects to concierge nudge if concierge and jetpack are not in the cart, premium is in the cart, and the previous route is not the nudge', () => {
		isEnabled.mockImplementation( ( flag ) => flag === 'upsell/concierge-session' );
		const cart = {
			products: [
				{
					product_slug: 'value_bundle',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: '1234abcd',
		} );
		expect( url ).toBe( '/checkout/offer-quickstart-session/1234abcd/foo.bar' );
	} );

	it( 'redirects to thank-you page (with concierge display mode) if concierge is in the cart', () => {
		isEnabled.mockImplementation( ( flag ) => flag === 'upsell/concierge-session' );
		const cart = {
			products: [
				{
					product_slug: 'concierge-session',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: '1234abcd',
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/1234abcd?d=concierge' );
	} );

	it( 'redirects to thank-you page if jetpack is in the cart', () => {
		isEnabled.mockImplementation( ( flag ) => flag === 'upsell/concierge-session' );
		const cart = {
			products: [
				{
					product_slug: 'jetpack_premium',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: '1234abcd',
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/1234abcd' );
	} );

	it( 'redirects to thank you page if concierge and jetpack are not in the cart, personal is in the cart, but the previous route is the nudge', () => {
		isEnabled.mockImplementation( ( flag ) => flag === 'upsell/concierge-session' );
		const cart = {
			products: [
				{
					product_slug: 'personal-bundle',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: '1234abcd',
			previousRoute: '/checkout/foo.bar/offer-plan-upgrade/premium/1234abcd',
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/1234abcd' );
	} );
} );
