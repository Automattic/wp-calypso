import { buildChainedCheckoutUrl, appendReturnSignals } from '../build-checkout-url';

describe( 'appendReturnSignals', () => {
	it( 'appends wpcom_purchase=1 and wpcom_site to a URL with no existing params', () => {
		const result = appendReturnSignals( 'https://allowed.example/return', 'example.wordpress.com' );
		expect( result ).toBe(
			'https://allowed.example/return?wpcom_purchase=1&wpcom_site=example.wordpress.com'
		);
	} );

	it( 'appends to a URL that already has params', () => {
		const result = appendReturnSignals(
			'https://allowed.example/return?session=abc',
			'example.wordpress.com'
		);
		expect( result ).toContain( 'session=abc' );
		expect( result ).toContain( 'wpcom_purchase=1' );
		expect( result ).toContain( 'wpcom_site=example.wordpress.com' );
	} );

	it( 'URL-encodes siteSlug values containing path-like characters', () => {
		const result = appendReturnSignals( 'https://allowed.example/r', 'foo.example.com' );
		expect( result ).toContain( 'wpcom_site=foo.example.com' );
	} );
} );

describe( 'buildChainedCheckoutUrl', () => {
	it( 'builds the canonical happy-path URL', () => {
		const url = buildChainedCheckoutUrl( {
			siteSlug: 'example.wordpress.com',
			siteId: 12345,
			plan: 'business-bundle',
			externalRedirect:
				'https://allowed.example/return?wpcom_purchase=1&wpcom_site=example.wordpress.com',
			coupon: 'SAVE20',
		} );

		// The outer redirect_to is the transferring-hosted-site URL with the
		// external redirect embedded as a single-level-encoded query param.
		expect( url ).toContain( '/checkout/business-bundle/example.wordpress.com?' );
		expect( url ).toContain( 'coupon=SAVE20' );
		expect( url ).toContain( 'signup=1' );

		// Decoding the outer redirect_to should yield the transferring URL with
		// the external URL intact.
		const parsedOuter = new URL( url, 'https://wordpress.com' );
		const outerRedirect = parsedOuter.searchParams.get( 'redirect_to' );
		expect( outerRedirect ).not.toBeNull();
		expect( outerRedirect ).toContain( '/setup/transferring-hosted-site' );

		const parsedInner = new URL( outerRedirect as string, 'https://wordpress.com' );
		// The transferring URL must carry siteSlug + siteId so WAIT_FOR_ATOMIC's
		// useSiteData() hook can read them and start polling.
		expect( parsedInner.searchParams.get( 'siteSlug' ) ).toBe( 'example.wordpress.com' );
		expect( parsedInner.searchParams.get( 'siteId' ) ).toBe( '12345' );
		expect( parsedInner.searchParams.get( 'redirect_to' ) ).toBe(
			'https://allowed.example/return?wpcom_purchase=1&wpcom_site=example.wordpress.com'
		);
	} );

	it( 'omits siteId from the transferring URL when not provided', () => {
		const url = buildChainedCheckoutUrl( {
			siteSlug: 'example.wordpress.com',
			plan: 'business-bundle',
			externalRedirect: 'https://allowed.example/return',
			coupon: null,
		} );

		const parsedOuter = new URL( url, 'https://wordpress.com' );
		const outerRedirect = parsedOuter.searchParams.get( 'redirect_to' );
		const parsedInner = new URL( outerRedirect as string, 'https://wordpress.com' );

		expect( parsedInner.searchParams.get( 'siteSlug' ) ).toBe( 'example.wordpress.com' );
		expect( parsedInner.searchParams.has( 'siteId' ) ).toBe( false );
	} );

	it( 'falls back to /home/<slug> when externalRedirect is null', () => {
		const url = buildChainedCheckoutUrl( {
			siteSlug: 'example.wordpress.com',
			plan: 'business-bundle',
			externalRedirect: null,
			coupon: null,
		} );

		const parsedOuter = new URL( url, 'https://wordpress.com' );
		const outerRedirect = parsedOuter.searchParams.get( 'redirect_to' );
		expect( outerRedirect ).toBe( '/home/example.wordpress.com' );
	} );

	it( 'omits coupon when null', () => {
		const url = buildChainedCheckoutUrl( {
			siteSlug: 'example.wordpress.com',
			plan: 'business-bundle',
			externalRedirect: null,
			coupon: null,
		} );
		expect( url ).not.toContain( 'coupon=' );
	} );

	it( 'URL-encodes a siteSlug that contains special characters', () => {
		const url = buildChainedCheckoutUrl( {
			siteSlug: 'a b.example.com',
			plan: 'business-bundle',
			externalRedirect: null,
			coupon: null,
		} );
		expect( url ).toContain( '/checkout/business-bundle/a%20b.example.com' );
	} );

	it( 'URL-encodes the plan slug', () => {
		const url = buildChainedCheckoutUrl( {
			siteSlug: 'example.wordpress.com',
			plan: 'business bundle', // hypothetical bad slug with space
			externalRedirect: null,
			coupon: null,
		} );
		expect( url ).toContain( '/checkout/business%20bundle/example.wordpress.com' );
	} );
} );
