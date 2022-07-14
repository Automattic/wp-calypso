/**
 * @jest-environment jsdom
 */
import page from 'page';
import {
	addUrlToPendingPageRedirect,
	redirectThroughPending,
	getRedirectFromPendingPage,
} from '../lib/pending-page';

jest.mock( 'page' );

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
			`/checkout/thank-you/${ siteSlug }/pending/${ orderId }?redirectTo=${ encodeURIComponent(
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
			`${ currentWindowOrigin }/checkout/thank-you/${ siteSlug }/pending/${ orderId }?redirectTo=${ encodeURIComponent(
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
			`${ currentWindowOrigin }/checkout/thank-you/${ siteSlug }/pending/${ orderId }?redirectTo=${ encodeURIComponent(
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
			`${ currentWindowOrigin }/checkout/thank-you/no-site/pending/${ orderId }?redirectTo=${ encodeURIComponent(
				finalUrl
			) }&receiptId=${ encodedReceiptPlaceholder }`
		);
	} );

	it( 'returns a order ID placeholder when no order ID is provided', () => {
		const finalUrl = '/foo/bar/baz';
		const siteSlug = 'example2.com';
		const actual = addUrlToPendingPageRedirect( finalUrl, {
			siteSlug,
		} );
		expect( actual ).toEqual(
			`${ currentWindowOrigin }/checkout/thank-you/${ siteSlug }/pending/:orderId?redirectTo=${ encodeURIComponent(
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
			`${ currentWindowOrigin }/checkout/thank-you/${ siteSlug }/pending/:orderId?redirectTo=${ encodeURIComponent(
				finalUrl
			) }&receiptId=${ receiptId }`
		);
	} );
} );

describe( 'redirectThroughPending', () => {
	it( 'navigates to a relative URL when source is relative', () => {
		const redirectSpy = jest.fn();
		( page as jest.MockedFunction< typeof page > ).mockImplementation( redirectSpy );
		const finalUrl = '/foo/bar/baz';
		const siteSlug = 'example2.com';
		const orderId = '12345';
		redirectThroughPending( finalUrl, {
			siteSlug,
			orderId,
		} );
		expect( redirectSpy ).toHaveBeenCalledWith(
			`/checkout/thank-you/${ siteSlug }/pending/${ orderId }?redirectTo=${ encodeURIComponent(
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
			`${ currentWindowOrigin }/checkout/thank-you/${ siteSlug }/pending/${ orderId }?redirectTo=${ encodeURIComponent(
				finalUrl
			) }&receiptId=${ encodedReceiptPlaceholder }`
		);
		delete global.window.location;
	} );
} );

describe( 'getRedirectFromPendingPage', () => {
	it( 'returns a simple relative url if there is also a receipt', () => {
		const actual = getRedirectFromPendingPage( { redirectTo: '/home', receiptId: 12345 } );
		expect( actual ).toEqual( { url: '/home' } );
	} );

	it( 'returns a receipt interpolated relative url if there is also a receipt', () => {
		const actual = getRedirectFromPendingPage( {
			redirectTo: '/home/:receiptId',
			receiptId: 12345,
		} );
		expect( actual ).toEqual( { url: '/home/12345' } );
	} );

	it( 'returns a simple absolute url if it is allowed and there is also a receipt', () => {
		const actual = getRedirectFromPendingPage( {
			redirectTo: 'https://wordpress.com/home',
			receiptId: 12345,
		} );
		expect( actual ).toEqual( { url: 'https://wordpress.com/home' } );
	} );

	it( 'returns a simple absolute url if it matches the siteSlug and there is also a receipt', () => {
		const actual = getRedirectFromPendingPage( {
			redirectTo: 'https://example.com/home',
			receiptId: 12345,
			siteSlug: 'example.com',
		} );
		expect( actual ).toEqual( { url: 'https://example.com/home' } );
	} );

	it( 'returns a receipt interpolated absolute url if it is allowed and there is also a receipt', () => {
		const actual = getRedirectFromPendingPage( {
			redirectTo: 'https://wordpress.com/home/:receiptId',
			receiptId: 12345,
		} );
		expect( actual ).toEqual( { url: 'https://wordpress.com/home/12345' } );
	} );

	it( 'returns a generic siteless url for an absolute url if it is not allowed and there is also a receipt', () => {
		const actual = getRedirectFromPendingPage( {
			redirectTo: 'https://example.com/home',
			receiptId: 12345,
		} );
		expect( actual ).toEqual( { url: '/checkout/thank-you/no-site/12345' } );
	} );

	it( 'returns a generic url with a site for an absolute url if it is not allowed and there is also a receipt and a site', () => {
		const actual = getRedirectFromPendingPage( {
			redirectTo: 'https://example.com/home',
			receiptId: 12345,
			siteSlug: 'foo.bar',
		} );
		expect( actual ).toEqual( { url: '/checkout/thank-you/foo.bar/12345' } );
	} );
} );
