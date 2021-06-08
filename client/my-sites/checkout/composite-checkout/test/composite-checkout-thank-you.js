/**
 * This is required to prevent "ReferenceError: window is not defined"
 *
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import getThankYouPageUrl from '../hooks/use-get-thank-you-url/get-thank-you-page-url';
import { isEnabled } from '@automattic/calypso-config';
import {
	PLAN_ECOMMERCE,
	JETPACK_REDIRECT_URL,
	redirectCheckoutToWpAdmin,
} from '@automattic/calypso-products';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

let mockGSuiteCountryIsValid = true;
jest.mock( 'calypso/lib/user', () =>
	jest.fn( () => ( {
		get: () => ( { is_valid_google_apps_country: mockGSuiteCountryIsValid } ),
	} ) )
);

jest.mock( 'calypso/lib/jetpack/is-jetpack-cloud', () => jest.fn() );
jest.mock( '@automattic/calypso-products', () => ( {
	...jest.requireActual( '@automattic/calypso-products' ),
	redirectCheckoutToWpAdmin: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-config', () => {
	const mock = () => 'development';
	mock.isEnabled = jest.fn();
	return mock;
} );

// Temporary A/B test to dial down the concierge upsell, check pau2Xa-1bk-p2.
jest.mock( 'calypso/lib/naive-client-side-rollout', () => ( {
	badNaiveClientSideRollout: jest.fn( () => true ),
} ) );

const defaultArgs = {
	getUrlFromCookie: jest.fn( () => null ),
	saveUrlToCookie: jest.fn(),
};

describe( 'getThankYouPageUrl', () => {
	beforeEach( () => {
		isJetpackCloud.mockImplementation( () => false );
		redirectCheckoutToWpAdmin.mockImplementation( () => false );
	} );

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

	it( 'redirects to the thank-you pending page with a order id when a site and orderId is set even if the quickstart offer would normally be included', () => {
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
			orderId: '1234abcd',
			cart,
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/pending/1234abcd' );
	} );

	// Note: This just verifies the existing behavior; this URL is invalid unless
	// placed after a `redirectTo` query string; see the redirect payment
	// processor
	it( 'redirects to the quickstart offer thank-you page with a placeholder receipt id when a site but no orderId is set and the cart contains the personal plan', () => {
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
		} );
		expect( url ).toBe( '/checkout/offer-quickstart-session/:receiptId/foo.bar' );
	} );

	// Note: This just verifies the existing behavior; this URL is invalid unless
	// placed after a `redirectTo` query string; see the redirect payment
	// processor
	it( 'redirects to the business plan bump offer page with a placeholder receipt id when a site but no orderId is set and the cart contains the premium plan', () => {
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
		} );
		expect( url ).toBe( '/checkout/foo.bar/offer-plan-upgrade/business/:receiptId' );
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

	it( 'redirects to the Jetpack Redirect API if checkout is on Jetpack Cloud and there is a non-atomic jetpack product', () => {
		isJetpackCloud.mockImplementation( () => true );
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: '1234abcd',
			isJetpackNotAtomic: true,
			productAliasFromUrl: 'jetpack_backup_daily',
		} );
		expect( url ).toBe(
			`${ JETPACK_REDIRECT_URL }&site=foo.bar&query=product%3Djetpack_backup_daily%26thank-you%3Dtrue`
		);
	} );

	it( 'redirects to the Jetpack Redirect API if checkout is on Jetpack Cloud and there is a non-atomic jetpack product in the cart', () => {
		isJetpackCloud.mockImplementation( () => true );
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: '1234abcd',
			isJetpackNotAtomic: true,
			cart: {
				products: [ { product_slug: 'jetpack_backup_realtime' } ],
			},
		} );
		expect( url ).toBe(
			`${ JETPACK_REDIRECT_URL }&site=foo.bar&query=product%3Djetpack_backup_realtime%26thank-you%3Dtrue`
		);
	} );

	it( 'redirects to the Jetpack Redirect API if checkout is on Jetpack Cloud and there is a non-atomic Jetpack Security plan', () => {
		isJetpackCloud.mockImplementation( () => true );
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: '1234abcd',
			isJetpackNotAtomic: true,
			productAliasFromUrl: 'jetpack_security_daily_monthly',
		} );
		expect( url ).toBe(
			`${ JETPACK_REDIRECT_URL }&site=foo.bar&query=product%3Djetpack_security_daily_monthly%26thank-you%3Dtrue`
		);
	} );

	it( 'redirects to the Jetpack Redirect API if checkout is on Jetpack Cloud and there is a non-atomic Jetpack Security plan is in the cart', () => {
		isJetpackCloud.mockImplementation( () => true );
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: '1234abcd',
			isJetpackNotAtomic: true,
			cart: {
				products: [ { product_slug: 'jetpack_security_daily' } ],
			},
		} );
		expect( url ).toBe(
			`${ JETPACK_REDIRECT_URL }&site=foo.bar&query=product%3Djetpack_security_daily%26thank-you%3Dtrue`
		);
	} );

	it( 'redirects to the Jetpack Redirect API if checkout is on Jetpack Cloud and there is a non-atomic Jetpack Complete plan is in the cart', () => {
		isJetpackCloud.mockImplementation( () => true );
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: '1234abcd',
			isJetpackNotAtomic: true,
			cart: {
				products: [ { product_slug: 'jetpack_complete' } ],
			},
		} );
		expect( url ).toBe(
			`${ JETPACK_REDIRECT_URL }&site=foo.bar&query=product%3Djetpack_complete%26thank-you%3Dtrue`
		);
	} );

	it( 'redirects to the sites wp-admin if checkout is on Jetpack Cloud and if redirectCheckoutToWpAdmin() flag is true and there is a non-atomic jetpack product', () => {
		isJetpackCloud.mockImplementation( () => true );
		redirectCheckoutToWpAdmin.mockImplementation( () => true );
		const adminUrl = 'https://my.site/wp-admin/';
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			isJetpackNotAtomic: true,
			cart: {
				products: [ { product_slug: 'jetpack_complete' } ],
			},
			adminUrl,
		} );
		expect( url ).toBe( `https://my.site/wp-admin/admin.php?page=jetpack#/recommendations` );
	} );

	it( 'redirects to the plans page with thank-you query string if there is a non-atomic jetpack product', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: '1234abcd',
			isJetpackNotAtomic: true,
			productAliasFromUrl: 'jetpack_backup_daily',
		} );
		expect( url ).toBe( '/plans/my-plan/foo.bar?thank-you=true&product=jetpack_backup_daily' );
	} );

	it( 'redirects to the plans page with thank-you query string if there is a non-atomic jetpack product in the cart', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: '1234abcd',
			isJetpackNotAtomic: true,
			cart: {
				products: [ { product_slug: 'jetpack_backup_realtime' } ],
			},
		} );
		expect( url ).toBe( '/plans/my-plan/foo.bar?thank-you=true&product=jetpack_backup_realtime' );
	} );

	it( 'redirects to the plans page with thank-you query string if there is the non-atomic Jetpack Security plan', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: '1234abcd',
			isJetpackNotAtomic: true,
			productAliasFromUrl: 'jetpack_security_daily_monthly',
		} );
		expect( url ).toBe(
			'/plans/my-plan/foo.bar?thank-you=true&product=jetpack_security_daily_monthly'
		);
	} );

	it( 'redirects to the plans page with thank-you query string if non-atomic Jetpack Security plan is in the cart', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: '1234abcd',
			isJetpackNotAtomic: true,
			cart: {
				products: [ { product_slug: 'jetpack_security_daily' } ],
			},
		} );
		expect( url ).toBe( '/plans/my-plan/foo.bar?thank-you=true&product=jetpack_security_daily' );
	} );

	it( 'redirects to the plans page with thank-you query string if non-atomic Jetpack Complete plan is in the cart', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: '1234abcd',
			isJetpackNotAtomic: true,
			cart: {
				products: [ { product_slug: 'jetpack_complete' } ],
			},
		} );
		expect( url ).toBe( '/plans/my-plan/foo.bar?thank-you=true&product=jetpack_complete' );
	} );

	it( 'redirects to the plans page with thank-you query string and jetpack onboarding if there is a non-atomic legacy jetpack plan in the cart', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: '1234abcd',
			isJetpackNotAtomic: true,
			cart: {
				products: [ { product_slug: 'jetpack_premium' } ],
			},
		} );
		expect( url ).toBe( '/plans/my-plan/foo.bar?thank-you=true&install=all' );
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

	it( 'redirects to the afterPurchaseUrl from a cart item if set', () => {
		const cart = {
			products: [ { extra: { afterPurchaseUrl: '/after/purchase/url' } } ],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			cart,
			siteSlug: 'foo.bar',
		} );
		expect( url ).toBe( '/after/purchase/url' );
	} );

	it( 'redirects to the afterPurchaseUrl from the most recent cart item if multiple are set', () => {
		const cart = {
			products: [
				{
					product_slug: 'older_product',
					time_added_to_cart: 1617228489,
					extra: { afterPurchaseUrl: '/older/purchase/url' },
				},
				{
					product_slug: 'newer_product',
					time_added_to_cart: 1617228689,
					extra: { afterPurchaseUrl: '/newer/purchase/url' },
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			cart,
			siteSlug: 'foo.bar',
		} );
		expect( url ).toBe( '/newer/purchase/url' );
	} );

	it( 'redirects to internal redirectTo url if set', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			redirectTo: '/foo/bar',
		} );
		expect( url ).toBe( '/foo/bar' );
	} );

	it( 'redirects to internal redirectTo url if set even if afterPurchaseUrl exists on a cart item', () => {
		const cart = {
			products: [ { extra: { afterPurchaseUrl: '/after/purchase/url' } } ],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			cart,
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
			products: [ { subscription_id: '123abc', extra: { purchaseType: 'renewal' } } ],
		};
		const url = getThankYouPageUrl( { ...defaultArgs, siteSlug: 'foo.bar', cart } );
		expect( url ).toBe( '/me/purchases/foo.bar/123abc' );
	} );

	it( 'does not redirect to url from cookie if isEligibleForSignupDestinationResult is false', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		const cart = {
			products: [ { product_slug: 'foo' } ],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			getUrlFromCookie,
			isEligibleForSignupDestinationResult: false,
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/:receiptId' );
	} );

	it( 'Redirects to root if previous receipt is "noPreviousPurchase" and isEligibleForSignupDestinationResult is false', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		const cart = {
			products: [ { product_slug: 'foo' } ],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			receiptId: 'noPreviousPurchase',
			cart,
			getUrlFromCookie,
			isEligibleForSignupDestinationResult: false,
		} );
		expect( url ).toBe( '/' );
	} );

	it( 'redirects to afterPurchaseUrl if set even if there is a url from a cookie', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		const cart = {
			products: [ { product_slug: 'foo', extra: { afterPurchaseUrl: '/after/purchase/url' } } ],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			getUrlFromCookie,
			isEligibleForSignupDestinationResult: true,
		} );
		expect( url ).toBe( '/after/purchase/url' );
	} );

	it( 'redirects to url from cookie with notice type set to "purchase-success" if isEligibleForSignupDestination is set', () => {
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
		expect( url ).toBe( '/cookie?notice=purchase-success' );
	} );

	it( 'Should store the current URL in the redirect cookie when called from the editor', () => {
		const saveUrlToCookie = jest.fn();
		const cart = {
			products: [],
		};
		const url = 'http://localhost/editor';
		Object.defineProperty( window, 'location', {
			value: {
				href: url,
			},
		} );
		getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			isInEditor: true,
			saveUrlToCookie,
		} );
		expect( saveUrlToCookie ).toBeCalledWith( url );
	} );

	it( 'Should store the thank you URL in the redirect cookie when called from the editor with an e-commerce plan', () => {
		const saveUrlToCookie = jest.fn();
		const cart = {
			products: [
				{
					product_slug: PLAN_ECOMMERCE,
				},
			],
		};
		window.one = 1;
		getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			isInEditor: true,
			saveUrlToCookie,
		} );
		expect( saveUrlToCookie ).toBeCalledWith( '/checkout/thank-you/foo.bar/:receiptId' );
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

	it( 'redirects to business upgrade nudge if concierge and jetpack are not in the cart, and premium is in the cart', () => {
		isEnabled.mockImplementation( ( flag ) => flag === 'upsell/concierge-session' );
		const cart = {
			products: [
				{
					product_slug: 'value_bundle',
					bill_period: 365,
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: '1234abcd',
		} );
		expect( url ).toBe( '/checkout/foo.bar/offer-plan-upgrade/business/1234abcd' );
	} );

	it( 'redirects to business monthly upgrade nudge if concierge and jetpack are not in the cart, and premium monthly is in the cart', () => {
		isEnabled.mockImplementation( ( flag ) => flag === 'upsell/concierge-session' );
		const cart = {
			products: [
				{
					product_slug: 'value_bundle_monthly',
					bill_period: 31,
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: '1234abcd',
		} );
		expect( url ).toBe( '/checkout/foo.bar/offer-plan-upgrade/business-monthly/1234abcd' );
	} );

	it( 'redirects to the thank-you pending page with an order id when the business upgrade nudge would normally be included', () => {
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
			orderId: '1234abcd',
			cart,
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/pending/1234abcd' );
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

	it( 'redirects to concierge nudge if concierge and jetpack are not in the cart, personal is in the cart, and the previous route is not the nudge', () => {
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

	it( 'redirects to thank you page if concierge and jetpack are not in the cart, personal is in the cart, but hideNudge is true', () => {
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
			hideNudge: true,
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/1234abcd' );
	} );

	it( 'redirects to thank you page (with traffic guide display mode) if traffic guide is in cart', () => {
		const cart = {
			products: [
				{
					product_slug: 'traffic-guide',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: '1234abcd',
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/1234abcd?d=traffic-guide' );
	} );

	it( 'redirects to thank you page (with traffic guide display mode) if traffic guide is in cart and site has a non-atomic jetpack plan', () => {
		const cart = {
			products: [
				{
					product_slug: 'traffic-guide',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: '1234abcd',
			isJetpackNotAtomic: true,
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/1234abcd?d=traffic-guide' );
	} );

	it( 'redirects to a url on the site we are checking out', () => {
		const redirectTo = 'https://foo.bar/some-path?with-args=yes';
		const url = getThankYouPageUrl( {
			...defaultArgs,
			redirectTo,
			siteSlug: 'foo.bar',
		} );
		expect( url ).toBe( redirectTo );
	} );

	it( 'redirects to the jetpack checkout thank you when jetpack checkout arg is set', () => {
		const cart = {
			products: [
				{
					product_slug: 'jetpack_backup_daily',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			isJetpackCheckout: true,
		} );
		expect( url ).toBe( '/checkout/jetpack/thank-you/foo.bar/jetpack_backup_daily' );
	} );

	it( 'redirects to the jetpack checkout thank you with `no_product` when jetpack checkout arg is set and the cart is empty', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			isJetpackCheckout: true,
		} );
		expect( url ).toBe( '/checkout/jetpack/thank-you/foo.bar/no_product' );
	} );
} );
