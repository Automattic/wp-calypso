/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import page from '@automattic/calypso-router';
import {
	SUCCESS,
	ERROR,
	FAILURE,
	UNKNOWN,
	PROCESSING,
} from 'calypso/state/order-transactions/constants';
import {
	addUrlToPendingPageRedirect,
	redirectThroughPending,
	getRedirectFromPendingPage,
} from '../lib/pending-page';

jest.mock( '@automattic/calypso-router' );

// This seems to be the default origin for jsdom + Jest.
const currentWindowOrigin = 'https://example.com';

const encodedReceiptPlaceholder = encodeURIComponent( ':receiptId' );

describe( 'addUrlToPendingPageRedirect', () => {
	beforeAll( () => {
		jest.spyOn( window, 'scrollTo' ).mockImplementation();
	} );

	it( 'returns a relative URL when in relative mode', () => {
		const finalUrl = '/foo/bar/baz';
		const siteSlug = 'example2.com';
		const orderId = '12345';
		const actual = addUrlToPendingPageRedirect( finalUrl, {
			siteSlug,
			orderId,
			urlType: 'relative',
		} );
		expect( actual ).toEqual(
			`/checkout/thank-you/${ siteSlug }/pending/${ orderId }?redirect_to=${ encodeURIComponent(
				finalUrl
			) }&receiptId=${ encodedReceiptPlaceholder }`
		);
	} );

	it( 'returns an absolute URL when in absolute mode', () => {
		const finalUrl = '/foo/bar/baz';
		const siteSlug = 'example2.com';
		const orderId = '12345';
		const actual = addUrlToPendingPageRedirect( finalUrl, {
			siteSlug,
			orderId,
			urlType: 'absolute',
		} );
		expect( actual ).toEqual(
			`${ currentWindowOrigin }/checkout/thank-you/${ siteSlug }/pending/${ orderId }?redirect_to=${ encodeURIComponent(
				finalUrl
			) }&receiptId=${ encodedReceiptPlaceholder }`
		);
	} );

	it( 'returns an absolute URL in default mode', () => {
		const finalUrl = '/foo/bar/baz';
		const siteSlug = 'example2.com';
		const orderId = '12345';
		const actual = addUrlToPendingPageRedirect( finalUrl, {
			siteSlug,
			orderId,
		} );
		expect( actual ).toEqual(
			`${ currentWindowOrigin }/checkout/thank-you/${ siteSlug }/pending/${ orderId }?redirect_to=${ encodeURIComponent(
				finalUrl
			) }&receiptId=${ encodedReceiptPlaceholder }`
		);
	} );

	it( 'returns a no-site URL if no siteSlug is provided', () => {
		const finalUrl = '/foo/bar/baz';
		const orderId = '12345';
		const actual = addUrlToPendingPageRedirect( finalUrl, {
			orderId,
		} );
		expect( actual ).toEqual(
			`${ currentWindowOrigin }/checkout/thank-you/no-site/pending/${ orderId }?redirect_to=${ encodeURIComponent(
				finalUrl
			) }&receiptId=${ encodedReceiptPlaceholder }`
		);
	} );

	it( 'returns a no-site URL and a siteSlug as `from_site_slug` if no siteSlug is provided but fromSiteSlug is provided', () => {
		const finalUrl = '/foo/bar/baz';
		const orderId = '12345';
		const fromSiteSlug = 'myJetpack.site';
		const actual = addUrlToPendingPageRedirect( finalUrl, {
			orderId,
			fromSiteSlug,
		} );
		expect( actual ).toEqual(
			`${ currentWindowOrigin }/checkout/thank-you/no-site/pending/${ orderId }?redirect_to=${ encodeURIComponent(
				finalUrl
			) }&receiptId=${ encodedReceiptPlaceholder }&from_site_slug=${ fromSiteSlug }`
		);
	} );

	it( 'returns a order ID placeholder when no order ID is provided', () => {
		const finalUrl = '/foo/bar/baz';
		const siteSlug = 'example2.com';
		const actual = addUrlToPendingPageRedirect( finalUrl, {
			siteSlug,
		} );
		expect( actual ).toEqual(
			`${ currentWindowOrigin }/checkout/thank-you/${ siteSlug }/pending/:orderId?redirect_to=${ encodeURIComponent(
				finalUrl
			) }&receiptId=${ encodedReceiptPlaceholder }`
		);
	} );

	it( 'returns a receipt ID as `receiptId` if provided', () => {
		const finalUrl = '/foo/bar/baz';
		const siteSlug = 'example2.com';
		const receiptId = 1234;
		const actual = addUrlToPendingPageRedirect( finalUrl, {
			siteSlug,
			receiptId,
		} );
		expect( actual ).toEqual(
			`${ currentWindowOrigin }/checkout/thank-you/${ siteSlug }/pending/:orderId?redirect_to=${ encodeURIComponent(
				finalUrl
			) }&receiptId=${ receiptId }`
		);
	} );

	it( 'returns a URL with Gravatar domain parameter', () => {
		const finalUrl = '/foo/bar/baz';
		const siteSlug = 'no-site';
		const orderId = '12345';
		const actual = addUrlToPendingPageRedirect( finalUrl, {
			siteSlug,
			orderId,
			urlType: 'relative',
			isGravatarDomain: true,
		} );
		expect( actual ).toEqual(
			`/checkout/thank-you/${ siteSlug }/pending/${ orderId }?redirect_to=${ encodeURIComponent(
				finalUrl
			) }&receiptId=${ encodedReceiptPlaceholder }&isGravatarDomain=1`
		);
	} );
} );

describe( 'redirectThroughPending', () => {
	it( 'navigates to a relative URL when source is relative', () => {
		const redirectSpy = jest.fn();
		jest.mocked( page ).mockImplementation( redirectSpy );
		const finalUrl = '/foo/bar/baz';
		const siteSlug = 'example2.com';
		const orderId = '12345';
		redirectThroughPending( finalUrl, {
			siteSlug,
			orderId,
		} );
		expect( redirectSpy ).toHaveBeenCalledWith(
			`/checkout/thank-you/${ siteSlug }/pending/${ orderId }?redirect_to=${ encodeURIComponent(
				finalUrl
			) }&receiptId=${ encodedReceiptPlaceholder }`
		);
	} );

	it( 'navigates to an absolute URL when in absolute mode', () => {
		Object.defineProperty( window, 'location', {
			value: {
				origin: currentWindowOrigin,
				href: currentWindowOrigin,
			},
		} );
		const finalUrl = 'https://wordpress.com/foo/bar/baz';
		const siteSlug = 'example2.com';
		const orderId = '12345';
		redirectThroughPending( finalUrl, {
			siteSlug,
			orderId,
		} );
		expect( global.window.location.href ).toEqual(
			`${ currentWindowOrigin }/checkout/thank-you/${ siteSlug }/pending/${ orderId }?redirect_to=${ encodeURIComponent(
				finalUrl
			) }&receiptId=${ encodedReceiptPlaceholder }`
		);
		delete global.window.location;
	} );
} );

describe( 'getRedirectFromPendingPage', () => {
	it( 'returns a simple relative url if there is also a receipt', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: '/home',
			receiptId: 12345,
		} );
		expect( actual ).toEqual( { url: '/home' } );
	} );

	it( 'returns a receipt interpolated relative url if there is also a receipt', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: '/home/:receiptId',
			receiptId: 12345,
		} );
		expect( actual ).toEqual( { url: '/home/12345' } );
	} );

	it( 'returns a simple absolute url if it is allowed and there is also a receipt', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: 'https://wordpress.com/home',
			receiptId: 12345,
		} );
		expect( actual ).toEqual( { url: 'https://wordpress.com/home' } );
	} );

	it( 'returns a simple absolute url if it matches the siteSlug and there is also a receipt', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: 'https://example.com/home',
			receiptId: 12345,
			siteSlug: 'example.com',
		} );
		expect( actual ).toEqual( { url: 'https://example.com/home' } );
	} );

	it( 'returns a simple absolute url if it matches the `fromSiteSlug` and there is no `siteSlug` and there is also a receipt', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: 'https://example.com/wp-admin/pamin.php?page=jetpack&connect_url_redirect',
			receiptId: 12345,
			fromSiteSlug: 'example.com',
		} );
		expect( actual ).toEqual( {
			url: 'https://example.com/wp-admin/pamin.php?page=jetpack&connect_url_redirect',
		} );
	} );

	it( 'returns a receipt interpolated absolute url if it is allowed and there is also a receipt', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: 'https://wordpress.com/home/:receiptId',
			receiptId: 12345,
		} );
		expect( actual ).toEqual( { url: 'https://wordpress.com/home/12345' } );
	} );

	it( 'returns a generic no-site url for an absolute url if it is not allowed and there is also a receipt', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: 'https://example.com/home',
			receiptId: 12345,
		} );
		expect( actual ).toEqual( { url: '/checkout/thank-you/no-site/12345' } );
	} );

	it( 'returns a generic url with a site for an absolute url if it is not allowed and there is also a receipt and a site', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: 'https://example.com/home',
			receiptId: 12345,
			siteSlug: 'foo.bar',
		} );
		expect( actual ).toEqual( { url: '/checkout/thank-you/foo.bar/12345' } );
	} );

	it( 'returns a no-site generic url if there is no receipt and no order and no site', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: '/home',
		} );
		expect( actual ).toEqual( { url: '/checkout/thank-you/no-site/unknown-receipt' } );
	} );

	it( 'returns a generic url with a site if there is no receipt and no order and a site', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: '/home',
			siteSlug: 'example.com',
		} );
		expect( actual ).toEqual( { url: '/checkout/thank-you/example.com/unknown-receipt' } );
	} );

	it( 'returns a simple success url if the transaction is successful', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: '/home',
			siteSlug: 'example.com',
			transaction: {
				orderId: 1,
				userId: 1,
				receiptId: 1234,
				processingStatus: SUCCESS,
			},
		} );
		expect( actual ).toEqual( { url: '/home' } );
	} );

	it( 'returns a success url with interpolated receipt if the transaction is successful', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: '/home/:receiptId',
			siteSlug: 'example.com',
			transaction: {
				orderId: 1,
				userId: 1,
				receiptId: 1234,
				processingStatus: SUCCESS,
			},
		} );
		expect( actual ).toEqual( { url: '/home/1234' } );
	} );

	it( 'returns a generic url if the transaction is successful and the url is not allowed', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: 'https://foo.bar/home/:receiptId',
			siteSlug: 'example.com',
			transaction: {
				orderId: 1,
				userId: 1,
				receiptId: 1234,
				processingStatus: SUCCESS,
			},
		} );
		expect( actual ).toEqual( { url: '/checkout/thank-you/example.com/1234' } );
	} );

	it( 'returns a saas redirect url if saas redirect url is not empty', () => {
		const url = 'https://vendor-app-url.com/thank-you-page/?intent-id=234234';

		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			saasRedirectUrl: url,
		} );
		expect( actual ).toEqual( { url: url } );
	} );

	it( 'returns a failure url if the transaction has an error and there is a receipt', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			receiptId: 12345,
			redirectTo: '/home',
			siteSlug: 'example.com',
			transaction: {
				orderId: 1,
				userId: 1,
				processingStatus: ERROR,
			},
		} );
		expect( actual ).toEqual( { url: '/checkout/failed-purchases', isError: true } );
	} );

	it( 'returns nothing if the transaction is loading and there is a receipt', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: true,
			receiptId: 12345,
			redirectTo: '/home',
			siteSlug: 'example.com',
		} );
		expect( actual ).toBeUndefined();
	} );

	it( 'returns a failure url if the transaction has an error', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: '/home',
			siteSlug: 'example.com',
			transaction: {
				orderId: 1,
				userId: 1,
				processingStatus: ERROR,
			},
		} );
		expect( actual ).toEqual( { url: '/checkout/failed-purchases', isError: true } );
	} );

	it( 'returns a checkout url if the transaction fails', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: '/home',
			siteSlug: 'example.com',
			transaction: {
				orderId: 1,
				userId: 1,
				processingStatus: FAILURE,
			},
		} );
		expect( actual ).toEqual( { url: '/checkout/example.com', isError: true } );
	} );

	it( 'returns a failure url if the transaction has an error and there is no site', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: '/home',
			transaction: {
				orderId: 1,
				userId: 1,
				processingStatus: ERROR,
			},
		} );
		expect( actual ).toEqual( { url: '/checkout/failed-purchases', isError: true } );
	} );

	it( 'returns a checkout url if the transaction fails and there is no site', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: '/home',
			transaction: {
				orderId: 1,
				userId: 1,
				processingStatus: FAILURE,
			},
		} );
		expect( actual ).toEqual( { url: '/checkout/no-site', isError: true } );
	} );

	it( 'returns a checkout url if there was an HTTP error', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: '/home',
			siteSlug: 'example.com',
			error: new Error( 'test error' ),
			orderId: 1,
		} );
		expect( actual ).toEqual( { url: '/checkout/example.com', isError: true } );
	} );

	it( 'returns a checkout url if the transaction is unknown', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: '/home',
			siteSlug: 'example.com',
			transaction: {
				orderId: 1,
				userId: 1,
				processingStatus: UNKNOWN,
			},
		} );
		expect( actual ).toEqual( { url: '/checkout/example.com', isUnknown: true } );
	} );

	it( 'returns a checkout url if the transaction is unknown and there is no site', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: '/home',
			transaction: {
				orderId: 1,
				userId: 1,
				processingStatus: UNKNOWN,
			},
		} );
		expect( actual ).toEqual( { url: '/checkout/no-site', isUnknown: true } );
	} );

	it( 'returns nothing if the transaction is not complete', () => {
		const actual = getRedirectFromPendingPage( {
			isLoadingOrder: false,
			redirectTo: '/home',
			transaction: {
				orderId: 1,
				userId: 1,
				processingStatus: PROCESSING,
			},
		} );
		expect( actual ).toBeUndefined();
	} );
} );
