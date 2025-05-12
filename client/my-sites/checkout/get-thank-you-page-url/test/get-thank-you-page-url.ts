/**
 * This is required to prevent "ReferenceError: window is not defined"
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import {
	JETPACK_REDIRECT_URL,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	PLAN_BLOGGER,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_PERSONAL,
	redirectCheckoutToWpAdmin,
	TITAN_MAIL_MONTHLY_SLUG,
	WPCOM_DIFM_LITE,
	PLAN_100_YEARS,
} from '@automattic/calypso-products';
import { NEWSLETTER_FLOW } from '@automattic/onboarding';
import {
	getEmptyResponseCart,
	getEmptyResponseCartProduct,
	ResponseCart,
	CartKey,
} from '@automattic/shopping-cart';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { addQueryArgs } from 'calypso/lib/url';
import getThankYouPageUrl from 'calypso/my-sites/checkout/get-thank-you-page-url';

jest.mock( 'calypso/lib/jetpack/is-jetpack-cloud', () => jest.fn() );
jest.mock( '@automattic/calypso-products', () => ( {
	...( jest.requireActual( '@automattic/calypso-products' ) as object ),
	redirectCheckoutToWpAdmin: jest.fn(),
} ) );

const samplePurchaseId = 12342424241;

function getMockCart(): ResponseCart {
	return { ...getEmptyResponseCart(), cart_key: 12345 };
}

const defaultArgs = {
	getUrlFromCookie: jest.fn( () => undefined ),
	saveUrlToCookie: jest.fn(),
};

function mockWindowLocation(): void {
	delete global.window.location;
	global.window = Object.create( window );
	global.window.location = {
		ancestorOrigins: null,
		hash: null,
		host: 'wordpress.com',
		port: '80',
		protocol: 'https:',
		hostname: 'dummy.com',
		href: 'http://wordpress.com/checkout/jetpack/jetpack_backup_daily',
		origin: 'http://wordpress.com/checkout/jetpack/jetpack_backup_daily',
		pathname: null,
		search: null,
		assign: null,
		reload: null,
		replace: null,
	};
}

describe( 'getThankYouPageUrl', () => {
	beforeEach( () => {
		( isJetpackCloud as jest.MockedFunction< typeof isJetpackCloud > ).mockImplementation(
			() => false
		);
		(
			redirectCheckoutToWpAdmin as jest.MockedFunction< typeof redirectCheckoutToWpAdmin >
		 ).mockImplementation( () => false );
	} );

	it( 'redirects to the root page when no site is set', () => {
		const url = getThankYouPageUrl( defaultArgs );
		expect( url ).toBe( '/' );
	} );

	it( 'redirects to the thank-you page with a purchase id when a site and purchaseId is set', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: samplePurchaseId,
		} );
		expect( url ).toBe( `/checkout/thank-you/foo.bar/${ samplePurchaseId }` );
	} );

	it( 'redirects to the thank-you page with a receipt id when a site and receiptId is set as a string', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			receiptId: String( samplePurchaseId ),
		} );
		expect( url ).toBe( `/checkout/thank-you/foo.bar/${ samplePurchaseId }` );
	} );

	it( 'redirects to the thank-you page with a receipt id when a site and receiptId is set', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			receiptId: samplePurchaseId,
		} );
		expect( url ).toBe( `/checkout/thank-you/foo.bar/${ samplePurchaseId }` );
	} );

	it( 'redirects to the receipt page with a placeholder id when a site and orderId is set', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/:receiptId' );
	} );

	it( 'redirects to the thank-you page with a placeholder receipt id when a site but no orderId is set and the cart contains the personal plan', () => {
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					product_slug: 'personal-bundle',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/:receiptId' );
	} );

	it( 'redirects to the thank-you page with a placeholder receiptId with a site when the cart is not empty but there is no receipt id', () => {
		const cart = {
			...getMockCart(),
			products: [ { ...getEmptyResponseCartProduct(), id: 'something' } ],
		};
		const url = getThankYouPageUrl( { ...defaultArgs, siteSlug: 'foo.bar', cart } );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/:receiptId' );
	} );

	it( 'redirects to the thank-you page with a feature when a site, a purchase id, and a valid feature is set', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			feature: 'all-free-features',
			purchaseId: samplePurchaseId,
		} );
		expect( url ).toBe(
			`/checkout/thank-you/features/all-free-features/foo.bar/${ samplePurchaseId }`
		);
	} );

	it( 'redirects to the thank-you page with a feature when a site, a receipt id, and a valid feature is set', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			feature: 'all-free-features',
			receiptId: samplePurchaseId,
		} );
		expect( url ).toBe(
			`/checkout/thank-you/features/all-free-features/foo.bar/${ samplePurchaseId }`
		);
	} );

	it( 'redirects to the thank-you feature page with a feature when a site, an order id, and a valid feature is set', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			feature: 'all-free-features',
		} );
		expect( url ).toBe( '/checkout/thank-you/features/all-free-features/foo.bar/:receiptId' );
	} );

	it( 'redirects to the thank-you page with a feature when a site and a valid feature is set with no receipt but the cart is not empty', () => {
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					id: 'something',
				},
			],
		};
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
			purchaseId: samplePurchaseId,
		} );
		expect( url ).toBe( `/checkout/thank-you/foo.bar/${ samplePurchaseId }` );
	} );

	it( 'redirects to the Jetpack Redirect API if checkout is on Jetpack Cloud and there is a non-atomic jetpack product', () => {
		( isJetpackCloud as jest.MockedFunction< typeof isJetpackCloud > ).mockImplementation(
			() => true
		);
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: samplePurchaseId,
			isJetpackNotAtomic: true,
			productAliasFromUrl: 'jetpack_backup_daily',
		} );
		expect( url ).toBe(
			`${ JETPACK_REDIRECT_URL }&site=foo.bar&query=product%3Djetpack_backup_daily%26thank-you%3Dtrue`
		);
	} );

	it( 'redirects to the Jetpack Redirect API if checkout is on Jetpack Cloud and there is a non-atomic jetpack product in the cart', () => {
		( isJetpackCloud as jest.MockedFunction< typeof isJetpackCloud > ).mockImplementation(
			() => true
		);
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: samplePurchaseId,
			isJetpackNotAtomic: true,
			cart: {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: 'jetpack_backup_realtime',
					},
				],
			},
		} );
		expect( url ).toBe(
			`${ JETPACK_REDIRECT_URL }&site=foo.bar&query=product%3Djetpack_backup_realtime%26thank-you%3Dtrue`
		);
	} );

	it( 'redirects to the Jetpack Redirect API if checkout is on Jetpack Cloud and there is a non-atomic Jetpack Security plan', () => {
		( isJetpackCloud as jest.MockedFunction< typeof isJetpackCloud > ).mockImplementation(
			() => true
		);
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: samplePurchaseId,
			isJetpackNotAtomic: true,
			productAliasFromUrl: 'jetpack_security_daily_monthly',
		} );
		expect( url ).toBe(
			`${ JETPACK_REDIRECT_URL }&site=foo.bar&query=product%3Djetpack_security_daily_monthly%26thank-you%3Dtrue`
		);
	} );

	it( 'redirects to the Jetpack Redirect API if checkout is on Jetpack Cloud and there is a non-atomic Jetpack Security plan is in the cart', () => {
		( isJetpackCloud as jest.MockedFunction< typeof isJetpackCloud > ).mockImplementation(
			() => true
		);
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: samplePurchaseId,
			isJetpackNotAtomic: true,
			cart: {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: 'jetpack_security_daily',
					},
				],
			},
		} );
		expect( url ).toBe(
			`${ JETPACK_REDIRECT_URL }&site=foo.bar&query=product%3Djetpack_security_daily%26thank-you%3Dtrue`
		);
	} );

	it( 'redirects to the Jetpack Redirect API if checkout is on Jetpack Cloud and there is a non-atomic Jetpack Complete plan is in the cart', () => {
		( isJetpackCloud as jest.MockedFunction< typeof isJetpackCloud > ).mockImplementation(
			() => true
		);
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: samplePurchaseId,
			isJetpackNotAtomic: true,
			cart: {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: 'jetpack_complete',
					},
				],
			},
		} );
		expect( url ).toBe(
			`${ JETPACK_REDIRECT_URL }&site=foo.bar&query=product%3Djetpack_complete%26thank-you%3Dtrue`
		);
	} );

	it( 'redirects to the sites wp-admin if checkout is on Jetpack Cloud and if redirectCheckoutToWpAdmin() flag is true and there is a non-atomic jetpack product and adminPageRedirect is omitted', () => {
		( isJetpackCloud as jest.MockedFunction< typeof isJetpackCloud > ).mockImplementation(
			() => true
		);
		(
			redirectCheckoutToWpAdmin as jest.MockedFunction< typeof redirectCheckoutToWpAdmin >
		 ).mockImplementation( () => true );
		const adminUrl = 'https://my.site/wp-admin/';
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			isJetpackNotAtomic: true,
			cart: {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: 'jetpack_complete',
					},
				],
			},
			adminUrl,
		} );
		expect( url ).toBe( 'https://my.site/wp-admin/admin.php?page=jetpack#/recommendations' );
	} );

	it( 'redirects to the sites wp-admin with adminPageRedirect if checkout is on Jetpack Cloud and if redirectCheckoutToWpAdmin() flag is true and there is a non-atomic jetpack product and adminPageRedirect is supplied', () => {
		( isJetpackCloud as jest.MockedFunction< typeof isJetpackCloud > ).mockImplementation(
			() => true
		);
		(
			redirectCheckoutToWpAdmin as jest.MockedFunction< typeof redirectCheckoutToWpAdmin >
		 ).mockImplementation( () => true );
		const adminUrl = 'https://my.site/wp-admin/';
		const adminPageRedirect = 'admin.php?page=jetpack-backup';
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			isJetpackNotAtomic: true,
			cart: {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: 'jetpack_complete',
					},
				],
			},
			adminUrl,
			adminPageRedirect,
		} );
		expect( url ).toBe( 'https://my.site/wp-admin/admin.php?page=jetpack-backup' );
	} );

	it( 'redirects to the sites wp-admin if checkout is on Jetpack Cloud and if redirectCheckoutToWpAdmin() flag is true and there is a non-atomic jetpack product and redirectTo is defined', () => {
		( isJetpackCloud as jest.MockedFunction< typeof isJetpackCloud > ).mockImplementation(
			() => true
		);
		(
			redirectCheckoutToWpAdmin as jest.MockedFunction< typeof redirectCheckoutToWpAdmin >
		 ).mockImplementation( () => true );
		const adminUrl = 'https://my.site/wp-admin/';
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			isJetpackNotAtomic: true,
			cart: {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: 'jetpack_complete',
					},
				],
			},
			adminUrl,
			redirectTo: 'admin.php?page=some-page',
		} );
		expect( url ).toBe( 'https://my.site/wp-admin/admin.php?page=some-page' );
	} );

	it( 'redirects to the plans page with thank-you query string if there is a non-atomic jetpack product', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: samplePurchaseId,
			isJetpackNotAtomic: true,
			productAliasFromUrl: 'jetpack_backup_daily',
		} );
		expect( url ).toBe( '/plans/my-plan/foo.bar?thank-you=true&product=jetpack_backup_daily' );
	} );

	it( 'redirects to the plans page with thank-you query string if there is a non-atomic jetpack product in the cart', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: samplePurchaseId,
			isJetpackNotAtomic: true,
			cart: {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: 'jetpack_backup_realtime',
					},
				],
			},
		} );
		expect( url ).toBe( '/plans/my-plan/foo.bar?thank-you=true&product=jetpack_backup_realtime' );
	} );

	it( 'redirects to the plans page with thank-you query string if there is the non-atomic Jetpack Security plan', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: samplePurchaseId,
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
			purchaseId: samplePurchaseId,
			isJetpackNotAtomic: true,
			cart: {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: 'jetpack_security_daily',
					},
				],
			},
		} );
		expect( url ).toBe( '/plans/my-plan/foo.bar?thank-you=true&product=jetpack_security_daily' );
	} );

	it( 'redirects to the plans page with thank-you query string if non-atomic Jetpack Complete plan is in the cart', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: samplePurchaseId,
			isJetpackNotAtomic: true,
			cart: {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: 'jetpack_complete',
					},
				],
			},
		} );
		expect( url ).toBe( '/plans/my-plan/foo.bar?thank-you=true&product=jetpack_complete' );
	} );

	it( 'redirects to the plans page with thank-you query string and jetpack onboarding if there is a non-atomic legacy jetpack plan in the cart', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: samplePurchaseId,
			isJetpackNotAtomic: true,
			cart: {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: 'jetpack_premium',
					},
				],
			},
		} );
		expect( url ).toBe( '/plans/my-plan/foo.bar?thank-you=true&install=all' );
	} );

	it( 'redirects to the plans page with thank-you query string and jetpack onboarding if there is a non-atomic jetpack plan', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: samplePurchaseId,
			isJetpackNotAtomic: true,
		} );
		expect( url ).toBe( '/plans/my-plan/foo.bar?thank-you=true&install=all' );
	} );

	it( 'redirects to the plans page with thank-you query string and jetpack onboarding if there is a non-atomic jetpack plan even if there is a feature', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: samplePurchaseId,
			feature: 'all-free-features',
			isJetpackNotAtomic: true,
		} );
		expect( url ).toBe( '/plans/my-plan/foo.bar?thank-you=true&install=all' );
	} );

	it( 'redirects to the afterPurchaseUrl from a cart item if set', () => {
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					extra: { afterPurchaseUrl: '/after/purchase/url' },
				},
			],
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
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					product_slug: 'older_product',
					time_added_to_cart: 1617228489,
					extra: { afterPurchaseUrl: '/older/purchase/url' },
				},
				{
					...getEmptyResponseCartProduct(),
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
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					extra: { afterPurchaseUrl: '/after/purchase/url' },
				},
			],
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
		expect( url ).toBe( '/checkout/thank-you/foo.bar/:receiptId' );
	} );

	it( 'redirects to external redirectTo url if it starts with admin_url for site', () => {
		const adminUrl = 'https://my.site/wp-admin/';
		const redirectTo = adminUrl + 'post.php?post=515';
		const url = getThankYouPageUrl( { ...defaultArgs, siteSlug: 'foo.bar', adminUrl, redirectTo } );
		expect( url ).toBe( redirectTo + '&action=edit&plan_upgraded=1' );
	} );

	it( 'redirects to external redirectTo url if the hostame is cloud.jetpack.com', () => {
		const adminUrl = 'https://my.site/wp-admin/';
		const redirectTo = 'https://cloud.jetpack.com/backup/foo.bar';
		const url = getThankYouPageUrl( { ...defaultArgs, siteSlug: 'foo.bar', adminUrl, redirectTo } );
		expect( url ).toBe( redirectTo );
	} );

	it( 'redirects to external redirectTo url if the hostame is jetpack.cloud.localhost', () => {
		const adminUrl = 'https://my.site/wp-admin/';
		const redirectTo = 'http://jetpack.cloud.localhost:3000/backup/foo.bar';
		const url = getThankYouPageUrl( { ...defaultArgs, siteSlug: 'foo.bar', adminUrl, redirectTo } );
		expect( url ).toBe( redirectTo );
	} );

	it( 'redirects to external redirectTo url if the hostame is jetpack.com', () => {
		const adminUrl = 'https://my.site/wp-admin/';
		const redirectTo = 'http://jetpack.com/';
		const url = getThankYouPageUrl( { ...defaultArgs, adminUrl, redirectTo } );
		expect( url ).toBe( redirectTo );
	} );

	it( 'redirects to external redirectTo url if the hostame is akismet.com', () => {
		const adminUrl = 'https://my.site/wp-admin/';
		const redirectTo = 'http://akismet.com/';
		const url = getThankYouPageUrl( { ...defaultArgs, adminUrl, redirectTo } );
		expect( url ).toBe( redirectTo );
	} );

	it( 'redirects to manage purchase page if there is a renewal', () => {
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					subscription_id: '123abc',
					extra: { purchaseType: 'renewal' },
				},
			],
		};
		const url = getThankYouPageUrl( { ...defaultArgs, siteSlug: 'foo.bar', cart } );
		expect( url ).toBe( '/me/purchases/foo.bar/123abc' );
	} );

	it( 'does not redirect to url from cookie if cart contains a Google Apps product without a domain receipt', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					product_slug: 'wp_google_workspace_business_starter_monthly',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			getUrlFromCookie,
		} );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/:receiptId' );
	} );

	it( 'does redirect to url from cookie if cart contains a Google Apps product with a domain receipt', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					product_slug: 'wp_google_workspace_business_starter_monthly',
					extra: {
						receipt_for_domain: 1234,
					},
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			getUrlFromCookie,
		} );
		expect( url ).toBe( '/cookie?notice=purchase-success' );
	} );

	it( 'Redirects to root if there is no purchase and cart contains a Google Apps product without a domain receipt', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					product_slug: 'wp_google_workspace_business_starter_monthly',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			receiptId: undefined,
			noPurchaseMade: true,
			cart,
			getUrlFromCookie,
		} );
		expect( url ).toBe( '/' );
	} );

	it( 'redirects to afterPurchaseUrl if set even if there is a url from a cookie', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					product_slug: 'foo',
					extra: { afterPurchaseUrl: '/after/purchase/url' },
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			getUrlFromCookie,
		} );
		expect( url ).toBe( '/after/purchase/url' );
	} );

	it( 'redirects to url from cookie with notice type set to "purchase-success"', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					product_slug: 'foo',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			getUrlFromCookie,
		} );
		expect( url ).toBe( '/cookie?notice=purchase-success' );
	} );

	it( 'Should store the current URL in the redirect cookie when called from the editor', () => {
		const saveUrlToCookie = jest.fn();
		const cart = {
			...getMockCart(),
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
			isInModal: true,
			saveUrlToCookie,
		} );
		expect( saveUrlToCookie ).toHaveBeenCalledWith( url );
	} );

	it( 'Should store the thank you URL in the redirect cookie when called from the editor with an e-commerce plan', () => {
		const saveUrlToCookie = jest.fn();
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					product_slug: PLAN_ECOMMERCE,
				},
			],
		};
		getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			isInModal: true,
			saveUrlToCookie,
		} );
		expect( saveUrlToCookie ).toHaveBeenCalledWith( '/checkout/thank-you/foo.bar/:receiptId' );
	} );

	it( 'redirects to url from cookie followed by purchase id if there is no site', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		const cart = {
			...getMockCart(),
			cart_key: 'no-site' as CartKey,
			products: [
				{
					...getEmptyResponseCartProduct(),
					id: '123',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			getUrlFromCookie,
			purchaseId: samplePurchaseId,
		} );
		expect( url ).toBe( `/cookie/${ samplePurchaseId }` );
	} );

	it( 'redirects to url from cookie followed by receipt id if there is no site', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		const cart = {
			...getMockCart(),
			cart_key: 'no-site' as CartKey,
			products: [ { ...getEmptyResponseCartProduct(), id: '123' } ],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: samplePurchaseId,
			getUrlFromCookie,
		} );
		expect( url ).toBe( `/cookie/${ samplePurchaseId }` );
	} );

	it( 'redirects to url from cookie followed by receipt id if there is a site but wpcom_signup_complete_flow_name from session storage is equal to "domain"', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		window.sessionStorage.setItem( 'wpcom_signup_complete_flow_name', 'domain' );
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					id: '123',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: samplePurchaseId,
			getUrlFromCookie,
		} );
		expect( url ).toBe( `/cookie/${ samplePurchaseId }` );
	} );

	it( 'redirects to url from cookie followed by receipt id placeholder if there is no site', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		const cart = {
			...getMockCart(),
			cart_key: 'no-site' as CartKey,
			products: [
				{
					...getEmptyResponseCartProduct(),
					id: '123',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			getUrlFromCookie,
		} );
		expect( url ).toBe( '/cookie/:receiptId' );
	} );

	it( 'redirects to url from cookie followed by placeholder receiptId if there is no site, and there is no receipt', () => {
		const getUrlFromCookie = jest.fn( () => '/cookie' );
		const cart = {
			...getMockCart(),
			cart_key: 'no-site' as CartKey,
			products: [
				{
					...getEmptyResponseCartProduct(),
					id: '123',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			getUrlFromCookie,
		} );
		expect( url ).toBe( '/cookie/:receiptId' );
	} );

	it( 'redirects to thank-you page followed by placeholder receiptId if no cookie url is set, there is no site, and there is no receipt', () => {
		const cart = {
			...getMockCart(),
			cart_key: 'no-site' as CartKey,
			products: [
				{
					...getEmptyResponseCartProduct(),
					id: '123',
				},
			],
		};
		const url = getThankYouPageUrl( { ...defaultArgs, siteSlug: 'foo.bar', cart } );
		expect( url ).toBe( '/checkout/thank-you/foo.bar/:receiptId' );
	} );

	it( 'redirects to thank-you page followed by purchase id if no cookie url is set, there is no site, and there is no receipt', () => {
		const cart = {
			...getMockCart(),
			cart_key: 'no-site' as CartKey,
			products: [
				{
					...getEmptyResponseCartProduct(),
					id: '123',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			purchaseId: samplePurchaseId,
			cart,
		} );
		expect( url ).toBe( `/checkout/thank-you/foo.bar/${ samplePurchaseId }` );
	} );

	it( 'redirects to thank-you page for a new site with a domain and some failed purchases', () => {
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					product_slug: 'some_domain',
					is_domain_registration: true,
					extra: { context: 'signup' },
					meta: 'my.site',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: samplePurchaseId,
		} );
		expect( url ).toBe( `/checkout/thank-you/foo.bar/${ samplePurchaseId }` );
	} );

	it( 'redirects to thank-you page for a new site without a domain', () => {
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					product_slug: 'some_domain',
					is_domain_registration: false,
					extra: { context: 'signup' },
					meta: 'my.site',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: samplePurchaseId,
		} );
		expect( url ).toBe( `/checkout/thank-you/foo.bar/${ samplePurchaseId }` );
	} );

	it( 'redirects to thank-you page for a new site with a domain and no failed purchases but G Suite is not in the cart if user is in invalid country', () => {
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					product_slug: 'some_domain',
					is_domain_registration: true,
					extra: { context: 'signup' },
					meta: 'my.site',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: samplePurchaseId,
		} );
		expect( url ).toBe( `/checkout/thank-you/foo.bar/${ samplePurchaseId }` );
	} );

	it( 'redirects to the thank you page if jetpack is not in the cart, blogger is in the cart, and the previous route is not the nudge', () => {
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					product_slug: 'blogger-bundle',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: samplePurchaseId,
		} );
		expect( url ).toBe( `/checkout/thank-you/foo.bar/${ samplePurchaseId }` );
	} );

	it( 'redirects to the thank you page if jetpack is not in the cart, personal is in the cart, and the previous route is not the nudge', () => {
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					product_slug: 'personal-bundle',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: samplePurchaseId,
		} );
		expect( url ).toBe( `/checkout/thank-you/foo.bar/${ samplePurchaseId }` );
	} );

	it( 'redirects to a Jetpack cloud redirectTo', () => {
		const redirectTo =
			'http://cloud.jetpack.com/purchases/add-payment-method/fast-hummingbird.jurassic.ninja';
		const url = getThankYouPageUrl( {
			...defaultArgs,
			redirectTo,
		} );
		expect( url ).toBe( redirectTo );
	} );

	describe( 'Professional Email upsell', () => {
		// We have to type cast this because we're only specifying incomplete data.
		// This should probably be completed someday.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const domains: any[] = [
			{
				name: 'domain-with-gsuite.com',
				currentUserCanAddEmail: true,
				googleAppsSubscription: { status: 'active' },
			},
			{
				name: 'domain-with-titan.com',
				currentUserCanAddEmail: true,
				titanMailSubscription: { status: 'active' },
			},
			{
				name: 'domain-eligible.com',
				currentUserCanAddEmail: true,
			},
			{
				name: 'domain-eligible-primary.com',
				currentUserCanAddEmail: true,
				isPrimary: true,
			},
			{
				name: 'domain-eligible-for-free-trial.com',
				currentUserCanAddEmail: true,
				titanMailSubscription: { isEligibleForIntroductoryOffer: true },
			},
			{
				name: 'domain-expired.com',
				currentUserCanAddEmail: true,
				expired: true,
			},
			{
				name: 'invalid.wpcomstaging.com',
				currentUserCanAddEmail: true,
				isWpcomStagingDomain: true,
			},
		];

		it( 'Is displayed if site has eligible domain and Blogger plan is in the cart', () => {
			const cart = {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: PLAN_BLOGGER,
					},
				],
			};

			const url = getThankYouPageUrl( {
				...defaultArgs,
				cart,
				domains,
				receiptId: samplePurchaseId,
				siteSlug: 'foo.bar',
			} );

			expect( url ).toBe(
				`/checkout/offer-professional-email/domain-eligible-for-free-trial.com/${ samplePurchaseId }/foo.bar`
			);
		} );

		it( 'Is displayed if site has eligible domain and Personal plan is in the cart', () => {
			const cart = {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: PLAN_PERSONAL,
					},
				],
			};

			const url = getThankYouPageUrl( {
				...defaultArgs,
				cart,
				domains,
				receiptId: samplePurchaseId,
				siteSlug: 'foo.bar',
			} );

			expect( url ).toBe(
				`/checkout/offer-professional-email/domain-eligible-for-free-trial.com/${ samplePurchaseId }/foo.bar`
			);
		} );

		it( 'Is displayed if site has eligible domain and Business plan is in the cart', () => {
			const cart = {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: PLAN_BUSINESS,
					},
				],
			};

			const url = getThankYouPageUrl( {
				...defaultArgs,
				cart,
				domains,
				receiptId: samplePurchaseId,
				siteSlug: 'foo.bar',
			} );

			expect( url ).toBe(
				`/checkout/offer-professional-email/domain-eligible-for-free-trial.com/${ samplePurchaseId }/foo.bar`
			);
		} );

		it( 'Is displayed if site has eligible domain and eCommerce plan is in the cart', () => {
			const cart = {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: PLAN_ECOMMERCE,
					},
				],
			};

			const url = getThankYouPageUrl( {
				...defaultArgs,
				cart,
				domains,
				receiptId: samplePurchaseId,
				siteSlug: 'foo.bar',
			} );

			expect( url ).toBe(
				`/checkout/offer-professional-email/domain-eligible-for-free-trial.com/${ samplePurchaseId }/foo.bar`
			);
		} );

		it( 'Is displayed if site has domain registration and eligible plan in the cart', () => {
			const cart = {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: PLAN_PERSONAL,
					},
					{
						...getEmptyResponseCartProduct(),
						meta: 'domain-from-cart.com',
						is_domain_registration: true,
					},
				],
			};

			const url = getThankYouPageUrl( {
				...defaultArgs,
				cart,
				domains,
				receiptId: samplePurchaseId,
				siteSlug: 'foo.bar',
			} );

			expect( url ).toBe(
				`/checkout/offer-professional-email/domain-from-cart.com/${ samplePurchaseId }/foo.bar`
			);
		} );

		it( 'Is displayed if user is buying a domain only registration', () => {
			const cart = {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						is_domain_registration: true,
						meta: 'foo.bar',
					},
				],
			};

			const url = getThankYouPageUrl( {
				...defaultArgs,
				siteSlug: 'no-site',
				cart,
				receiptId: samplePurchaseId,
			} );

			expect( url ).toBe( `/checkout/thank-you/no-site/${ samplePurchaseId }` );
		} );

		it( 'Is not displayed if cart is missing', () => {
			const url = getThankYouPageUrl( {
				...defaultArgs,
				domains,
				receiptId: samplePurchaseId,
				siteSlug: 'foo.bar',
			} );

			expect( url ).toBe( `/checkout/thank-you/foo.bar/${ samplePurchaseId }` );
		} );

		it( 'Is not displayed if Google Workspace is in the cart', () => {
			const cart = {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
					},
				],
			};

			const url = getThankYouPageUrl( {
				...defaultArgs,
				cart,
				domains,
				receiptId: samplePurchaseId,
				siteSlug: 'foo.bar',
			} );

			expect( url ).toBe( `/checkout/thank-you/foo.bar/${ samplePurchaseId }` );
		} );

		it( 'Is not displayed if Professional Email is in the cart', () => {
			const cart = {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: TITAN_MAIL_MONTHLY_SLUG,
					},
				],
			};

			const url = getThankYouPageUrl( {
				...defaultArgs,
				cart,
				domains,
				receiptId: samplePurchaseId,
				siteSlug: 'foo.bar',
			} );

			expect( url ).toBe( `/checkout/thank-you/foo.bar/${ samplePurchaseId }` );
		} );

		it( 'Is not displayed if nudges should be hidden and site has eligible domain and Personal plan is in the cart', () => {
			const cart = {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: PLAN_PERSONAL,
					},
				],
			};

			const url = getThankYouPageUrl( {
				...defaultArgs,
				cart,
				domains,
				hideNudge: true,
				receiptId: samplePurchaseId,
				siteSlug: 'foo.bar',
			} );

			expect( url ).toBe( `/checkout/thank-you/foo.bar/${ samplePurchaseId }` );
		} );
	} );

	it( 'redirects to thank-you page if jetpack is in the cart', () => {
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					product_slug: 'jetpack_premium',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: samplePurchaseId,
		} );
		expect( url ).toBe( `/checkout/thank-you/foo.bar/${ samplePurchaseId }` );
	} );

	it( 'redirects to thank you page if jetpack is not in the cart, personal is in the cart, but hideNudge is true', () => {
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					product_slug: 'personal-bundle',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			receiptId: samplePurchaseId,
			hideNudge: true,
		} );
		expect( url ).toBe( `/checkout/thank-you/foo.bar/${ samplePurchaseId }` );
	} );

	it( 'redirects to a url on the same site we are checking out', () => {
		const redirectTo = 'https://foo.bar/some-path?with-args=yes';
		const url = getThankYouPageUrl( {
			...defaultArgs,
			redirectTo,
			siteSlug: 'foo.bar',
		} );
		expect( url ).toBe( redirectTo );
	} );

	it( 'redirects to a url on the same subdirectory site we are checking out', () => {
		const redirectTo = 'https://foo.bar/subdirectory/some-path?with-args=yes';
		const url = getThankYouPageUrl( {
			...defaultArgs,
			redirectTo,
			siteSlug: 'foo.bar::subdirectory',
		} );
		expect( url ).toBe( redirectTo );
	} );

	it( 'redirects to the jetpack checkout thank you when jetpack checkout arg is set', () => {
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					product_slug: 'jetpack_backup_daily',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			sitelessCheckoutType: 'jetpack',
		} );
		expect( url ).toBe( '/checkout/jetpack/thank-you/foo.bar/jetpack_backup_daily' );
	} );

	it( 'redirects to the akismet checkout thank you when akismet siteless arg is set', () => {
		const cart = {
			...getMockCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					product_slug: 'ak_plus_yearly_2',
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			sitelessCheckoutType: 'akismet',
		} );
		expect( url ).toBe( '/checkout/akismet/thank-you/ak_plus_yearly_2' );
	} );

	it( 'redirects to the purchase management page when is akismet siteless and the purchaseType is a renewal', () => {
		const cart = {
			...getEmptyResponseCart(),
			products: [
				{
					...getEmptyResponseCartProduct(),
					product_slug: 'ak_plus_yearly_2',
					subscription_id: '123abc',
					extra: { purchaseType: 'renewal' },
				},
			],
		};
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			cart,
			sitelessCheckoutType: 'akismet',
		} );
		expect( url ).toBe( '/me/purchases/siteless.akismet.com/123abc' );
	} );

	it( 'redirects to the jetpack checkout thank you with `no_product` when jetpack checkout arg is set and the cart is empty', () => {
		const url = getThankYouPageUrl( {
			...defaultArgs,
			siteSlug: 'foo.bar',
			sitelessCheckoutType: 'jetpack',
		} );
		expect( url ).toBe( '/checkout/jetpack/thank-you/foo.bar/no_product' );
	} );

	describe( 'Plan Upgrade Upsell Nudge', () => {
		it( 'Does not offers discounted annual business plan upgrade when annual premium plan and DIFM light is purchased together.', () => {
			const cart = {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: 'value_bundle',
						bill_period: '365',
					},
					{
						...getEmptyResponseCartProduct(),
						product_slug: WPCOM_DIFM_LITE,
					},
				],
			};
			const url = getThankYouPageUrl( {
				...defaultArgs,
				siteSlug: 'foo.bar',
				receiptId: samplePurchaseId,
				cart,
			} );
			expect( url ).toBe( `/checkout/thank-you/foo.bar/${ samplePurchaseId }` );
		} );

		it( 'Does not offers discounted annual business plan for tailored flows (https://wp.me/p58i-cBr).', () => {
			[ NEWSLETTER_FLOW ].forEach( ( flowName ) => {
				const getUrlFromCookie = jest.fn( () => '/cookie' );

				// set a tailored flow name
				sessionStorage.setItem( 'wpcom_signup_complete_flow_name', flowName );

				const cart = {
					...getMockCart(),
					products: [
						{
							...getEmptyResponseCartProduct(),
							product_slug: 'value_bundle',
							bill_period: '365',
						},
					],
				};
				const url = getThankYouPageUrl( {
					...defaultArgs,
					getUrlFromCookie,
					cart,
				} );

				expect( url ).toBe( '/cookie?notice=purchase-success' );

				// clean up the tailored flow name
				sessionStorage.removeItem( 'wpcom_signup_complete_flow_name' );
			} );
		} );
	} );

	// Siteless checkout flow
	describe( 'Jetpack Siteless Checkout Thank You', () => {
		it( 'redirects when jetpack checkout arg is set, but siteSlug is undefined.', () => {
			const cart = {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: 'jetpack_backup_daily',
					},
				],
			};
			const url = getThankYouPageUrl( {
				...defaultArgs,
				siteSlug: undefined,
				cart,
				sitelessCheckoutType: 'jetpack',
			} );
			expect( url ).toBe(
				'/checkout/jetpack/thank-you/licensing-auto-activate/jetpack_backup_daily?receiptId=%3AreceiptId'
			);
		} );

		it( 'redirects with receiptId query param when a valid receipt ID is provided', () => {
			const cart = {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: 'jetpack_backup_daily',
					},
				],
			};
			const url = getThankYouPageUrl( {
				...defaultArgs,
				siteSlug: undefined,
				cart,
				sitelessCheckoutType: 'jetpack',
				receiptId: 80023,
			} );
			expect( url ).toBe(
				'/checkout/jetpack/thank-you/licensing-auto-activate/jetpack_backup_daily?receiptId=80023'
			);
		} );

		it( 'redirects with receiptId query param when a valid receipt ID is provided as a string', () => {
			const cart = {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: 'jetpack_backup_daily',
					},
				],
			};
			const url = getThankYouPageUrl( {
				...defaultArgs,
				siteSlug: undefined,
				cart,
				sitelessCheckoutType: 'jetpack',
				receiptId: '80023',
			} );
			expect( url ).toBe(
				'/checkout/jetpack/thank-you/licensing-auto-activate/jetpack_backup_daily?receiptId=80023'
			);
		} );

		it( 'redirects without receiptId query param when an invalid receipt ID is provided', () => {
			const cart = {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: 'jetpack_backup_daily',
					},
				],
			};
			const url = getThankYouPageUrl( {
				...defaultArgs,
				siteSlug: undefined,
				cart,
				sitelessCheckoutType: 'jetpack',
				// We have to type cast this because we're specifying invalid data.
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				receiptId: 'invalid receipt ID' as any,
			} );
			expect( url ).toBe(
				'/checkout/jetpack/thank-you/licensing-auto-activate/jetpack_backup_daily'
			);
		} );

		// Jetpack siteless "Connect after checkout" flow.
		// Triggered when `connectAfterCheckout: true`, `adminUrl` is set, `fromSiteSlug` is set,
		// and `siteSlug` is falsy(undefined).
		it( "redirects to the site's wp-admin `connect_url_redirect` url to initiate Jetpack connection", () => {
			mockWindowLocation();
			const adminUrl = 'https://my.site/wp-admin/';
			const fromSiteSlug = 'my.site';
			const productSlug = 'jetpack_backup_daily';

			const cart = {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: productSlug,
					},
				],
			};
			const url = getThankYouPageUrl( {
				...defaultArgs,
				siteSlug: undefined,
				cart,
				sitelessCheckoutType: 'jetpack',
				connectAfterCheckout: true,
				adminUrl: adminUrl,
				fromSiteSlug: fromSiteSlug,
				receiptId: 'invalid receipt ID' as any,
			} );

			const redirectAfterAuth = `https://wordpress.com/checkout/jetpack/thank-you/licensing-pending-async-activation/${ productSlug }?fromSiteSlug=${ fromSiteSlug }&productSlug=${ productSlug }`;

			expect( url ).toBe(
				addQueryArgs(
					{
						redirect_after_auth: redirectAfterAuth,
						from: 'connect-after-checkout',
					},
					`${ adminUrl }admin.php?page=jetpack&connect_url_redirect=true&jetpack_connect_login_redirect=true`
				)
			);
		} );

		it( "Connect-after-checkout flow redirects to the site's wp-admin `connect_url_redirect` url, along with a `redirect_to` query param when available", () => {
			mockWindowLocation();
			const adminUrl = 'https://my.site/wp-admin/';
			const fromSiteSlug = 'my.site';
			const productSlug = 'jetpack_backup_daily';

			const cart = {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: productSlug,
					},
				],
			};
			const url = getThankYouPageUrl( {
				...defaultArgs,
				siteSlug: undefined,
				cart,
				receiptId: 'invalid receipt ID' as any,
				sitelessCheckoutType: 'jetpack',
				connectAfterCheckout: true,
				adminUrl: adminUrl,
				fromSiteSlug: fromSiteSlug,
				redirectTo: 'https://foo.bar/some-path?with-args=yes',
			} );

			const redirectAfterAuth = `https://wordpress.com/checkout/jetpack/thank-you/licensing-pending-async-activation/${ productSlug }?fromSiteSlug=${ fromSiteSlug }&productSlug=${ productSlug }&redirect_to=https%3A%2F%2Ffoo.bar%2Fsome-path%3Fwith-args%3Dyes`;

			expect( url ).toBe(
				addQueryArgs(
					{
						redirect_after_auth: redirectAfterAuth,
						from: 'connect-after-checkout',
					},
					`${ adminUrl }admin.php?page=jetpack&connect_url_redirect=true&jetpack_connect_login_redirect=true`
				)
			);
		} );

		it( 'Redirects to the 100 year plan thank-you page when the 100 year plan is available', () => {
			const cart = {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: PLAN_100_YEARS,
					},
				],
			};
			const url = getThankYouPageUrl( {
				...defaultArgs,
				siteSlug: 'yourgroovydomain.com',
				receiptId: 999999,
				cart,
			} );
			expect( url ).toBe( '/checkout/100-year/thank-you/yourgroovydomain.com/999999' );
		} );

		it( 'redirects with jetpackTemporarySiteId query param when available', () => {
			const cart = {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: 'jetpack_backup_daily',
					},
				],
			};
			const url = getThankYouPageUrl( {
				...defaultArgs,
				siteSlug: undefined,
				cart,
				sitelessCheckoutType: 'jetpack',
				receiptId: 80023,
				jetpackTemporarySiteId: '123456789',
			} );
			expect( url ).toBe(
				'/checkout/jetpack/thank-you/licensing-auto-activate/jetpack_backup_daily?receiptId=80023&siteId=123456789'
			);
		} );

		it( 'Siteless checkout redirects with `redirect_to` query param when available', () => {
			const cart = {
				...getMockCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_slug: 'jetpack_backup_daily',
					},
				],
			};
			const url = getThankYouPageUrl( {
				...defaultArgs,
				siteSlug: undefined,
				cart,
				sitelessCheckoutType: 'jetpack',
				receiptId: 80023,
				redirectTo: 'https://foo.bar/some-path?with-args=yes',
			} );
			expect( url ).toBe(
				'/checkout/jetpack/thank-you/licensing-auto-activate/jetpack_backup_daily?receiptId=80023&redirect_to=https%3A%2F%2Ffoo.bar%2Fsome-path%3Fwith-args%3Dyes'
			);
		} );

		it( '/checkout/gift/thank-you/:site when gift purchase', () => {
			const url = getThankYouPageUrl( {
				...defaultArgs,
				cart: {
					...getMockCart(),
					products: [
						{
							...getEmptyResponseCartProduct(),
							product_slug: PLAN_PERSONAL,
						},
					],
					is_gift_purchase: true,
					gift_details: { receiver_blog_slug: 'foo.bar', receiver_blog_id: 123 },
				},
			} );
			expect( url ).toBe( '/checkout/gift/thank-you/foo.bar' );
		} );

		it( '/marketplace/than-you/:productSlug/:site when purchasing marketplace products', () => {
			const url = getThankYouPageUrl( {
				...defaultArgs,
				cart: {
					...getMockCart(),
					products: [
						{
							...getEmptyResponseCartProduct(),
							extra: {
								is_marketplace_product: true,
								product_type: 'marketplace_plugin',
								product_slug: 'plugin-slug1',
							},
						},
						{
							...getEmptyResponseCartProduct(),
							extra: {
								is_marketplace_product: true,
								product_type: 'marketplace_plugin',
								product_slug: 'plugin-slug2',
							},
						},
						{
							...getEmptyResponseCartProduct(),
							extra: {
								is_marketplace_product: true,
								product_type: 'marketplace_theme',
								product_slug: 'theme-slug1',
							},
						},
						{
							...getEmptyResponseCartProduct(),
							extra: {
								is_marketplace_product: true,
								product_type: 'marketplace_theme',
								product_slug: 'theme-slug2',
							},
						},
					],
				},
				siteSlug: 'site.slug',
			} );
			expect( url ).toBe(
				'/marketplace/thank-you/site.slug?plugins=plugin-slug1%2Cplugin-slug2&themes=theme-slug1%2Ctheme-slug2'
			); // %2C is a comma
		} );

		it( 'Error when gift purchase missing blog_slug', () => {
			expect( () =>
				getThankYouPageUrl( {
					...defaultArgs,
					cart: {
						...getMockCart(),
						products: [
							{
								...getEmptyResponseCartProduct(),
								product_slug: PLAN_PERSONAL,
							},
						],
						is_gift_purchase: true,
						gift_details: { receiver_blog_id: 123 },
					},
				} )
			).toThrow();
		} );
	} );

	describe( 'Congrats removals', () => {
		it( 'redirects to /email/:domain/manage/:site when purchasing only Titan Mail', () => {
			const url = getThankYouPageUrl( {
				...defaultArgs,
				cart: {
					...getMockCart(),
					products: [
						{
							...getEmptyResponseCartProduct(),
							product_slug: TITAN_MAIL_MONTHLY_SLUG,
							meta: 'example.com', // meta holds the domain - not the same thing as siteSlug
							extra: {
								email_users: [ { email: 'test@example.com' } ],
							},
						},
					],
				},
				siteSlug: 'foo.bar',
			} );
			expect( url ).toBe(
				`/email/example.com/manage/foo.bar?new-email=${ encodeURIComponent( 'test@example.com' ) }`
			);
		} );

		it( 'redirects to /checkout/thank-you when purchasing multiple products including titanmail', () => {
			const url = getThankYouPageUrl( {
				...defaultArgs,
				cart: {
					...getMockCart(),
					products: [
						{
							...getEmptyResponseCartProduct(),
							product_slug: 'personal-bundle',
						},
						{
							...getEmptyResponseCartProduct(),
							product_slug: TITAN_MAIL_MONTHLY_SLUG,
							extra: {
								email_users: [ { email: 'test@example.com' } ],
							},
						},
					],
				},
				siteSlug: 'foo.bar',
				receiptId: samplePurchaseId,
			} );
			expect( url ).toBe(
				`/checkout/thank-you/foo.bar/${ samplePurchaseId }?email=${ encodeURIComponent(
					'test@example.com'
				) }`
			);
		} );
	} );

	describe( 'A4A client checkout', () => {
		it( 'should return the redirectTo URL when provided for A4A client checkout', () => {
			const result = getThankYouPageUrl( {
				sitelessCheckoutType: 'a4a',
				redirectTo: '/custom/redirect/path',
			} );
			expect( result ).toBe( '/custom/redirect/path' );
		} );

		it( 'should return the default client subscriptions page for A4A client checkout without redirectTo', () => {
			const result = getThankYouPageUrl( {
				sitelessCheckoutType: 'a4a',
			} );
			expect( result ).toBe( '/client/subscriptions' );
		} );
	} );
} );
