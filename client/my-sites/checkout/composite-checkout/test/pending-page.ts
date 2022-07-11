import { addUrlToPendingPageRedirect } from '../lib/pending-page';

describe( 'addUrlToPendingPageRedirect', () => {
	it( 'returns a relative URL when in relative mode', () => {
		const finalUrl = '/foo/bar/baz';
		const siteSlug = 'example.com';
		const orderId = '12345';
		const actual = addUrlToPendingPageRedirect( finalUrl, siteSlug, orderId, 'relative' );
		expect( actual ).toEqual(
			`/checkout/thank-you/${ siteSlug }/pending/${ orderId }?redirectTo=${ encodeURIComponent(
				finalUrl
			) }`
		);
	} );

	it( 'returns an absolute URL when in absolute mode', () => {
		const finalUrl = '/foo/bar/baz';
		const siteSlug = 'example.com';
		const orderId = '12345';
		const actual = addUrlToPendingPageRedirect( finalUrl, siteSlug, orderId, 'absolute' );
		expect( actual ).toEqual(
			`https://wordpress.com/checkout/thank-you/${ siteSlug }/pending/${ orderId }?redirectTo=${ encodeURIComponent(
				finalUrl
			) }`
		);
	} );

	it( 'returns a no-site URL if no siteSlug is provided', () => {
		const finalUrl = '/foo/bar/baz';
		const siteSlug = undefined;
		const orderId = '12345';
		const actual = addUrlToPendingPageRedirect( finalUrl, siteSlug, orderId, 'absolute' );
		expect( actual ).toEqual(
			`https://wordpress.com/checkout/thank-you/no-site/pending/${ orderId }?redirectTo=${ encodeURIComponent(
				finalUrl
			) }`
		);
	} );

	it( 'returns a order ID placeholder when no order ID is provided', () => {
		const finalUrl = '/foo/bar/baz';
		const siteSlug = 'example.com';
		const orderId = undefined;
		const actual = addUrlToPendingPageRedirect( finalUrl, siteSlug, orderId, 'absolute' );
		expect( actual ).toEqual(
			`https://wordpress.com/checkout/thank-you/${ siteSlug }/pending/:orderId?redirectTo=${ encodeURIComponent(
				finalUrl
			) }`
		);
	} );
} );
