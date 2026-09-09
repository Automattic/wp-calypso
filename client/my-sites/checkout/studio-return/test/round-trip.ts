import { buildStudioCancelTo, buildStudioRedirectTo, getStudioCheckoutParams } from '../round-trip';

const STUDIO_SITE_ID = 'b419d647-95e0-4b32-95fc-6ee255aa465d';

describe( 'getStudioCheckoutParams', () => {
	it( 'returns null when studioSiteId is absent', () => {
		expect( getStudioCheckoutParams( {} ) ).toBeNull();
		expect( getStudioCheckoutParams( undefined ) ).toBeNull();
	} );

	it( 'rejects an empty or over-long studioSiteId', () => {
		expect( getStudioCheckoutParams( { studioSiteId: '' } ) ).toBeNull();
		expect( getStudioCheckoutParams( { studioSiteId: 'a'.repeat( 65 ) } ) ).toBeNull();
	} );

	// The format is Studio's to define, so we make no assumption about it beyond length. Values that
	// look hostile are safe because the deep link percent-encodes them — see the deep-link tests.
	it( 'accepts an id in a format we do not recognise', () => {
		[ 'not-a-uuid', 'local_site_42', 'a'.repeat( 64 ) ].forEach( ( studioSiteId ) => {
			expect( getStudioCheckoutParams( { studioSiteId } ) ).toEqual( { studioSiteId } );
		} );
	} );

	it( 'returns null when studioSiteId is repeated and parses to an array', () => {
		expect(
			getStudioCheckoutParams( { studioSiteId: [ STUDIO_SITE_ID, STUDIO_SITE_ID ] } )
		).toBeNull();
	} );

	it( 'treats studioSiteId alone as the trigger, without ref=studio', () => {
		expect( getStudioCheckoutParams( { studioSiteId: STUDIO_SITE_ID } ) ).toEqual( {
			studioSiteId: STUDIO_SITE_ID,
		} );
	} );

	it( 'echoes a well-formed studioReturnTo', () => {
		expect(
			getStudioCheckoutParams( {
				studioSiteId: STUDIO_SITE_ID,
				studioReturnTo: 'publish-site',
			} )
		).toEqual( { studioSiteId: STUDIO_SITE_ID, studioReturnTo: 'publish-site' } );
	} );

	it( 'drops an unusable studioReturnTo rather than rejecting the whole checkout', () => {
		[ '', 'a'.repeat( 65 ), [ 'publish-site' ] ].forEach( ( studioReturnTo ) => {
			expect( getStudioCheckoutParams( { studioSiteId: STUDIO_SITE_ID, studioReturnTo } ) ).toEqual(
				{ studioSiteId: STUDIO_SITE_ID }
			);
		} );
	} );
} );

describe( 'buildStudioRedirectTo', () => {
	it( 'targets the real thank-you page with a :receiptId placeholder', () => {
		const redirectTo = buildStudioRedirectTo( 'example.wordpress.com', {
			studioSiteId: STUDIO_SITE_ID,
			studioReturnTo: 'publish-site',
		} );

		// The placeholder must survive verbatim — the pending page interpolates it by string match.
		expect( redirectTo ).toContain( '/checkout/thank-you/example.wordpress.com/:receiptId' );

		const params = new URL( redirectTo, 'https://wordpress.com' ).searchParams;
		expect( params.get( 'studioSiteId' ) ).toBe( STUDIO_SITE_ID );
		expect( params.get( 'studioReturnTo' ) ).toBe( 'publish-site' );
	} );

	it( 'falls back to no-site for siteless purchases', () => {
		expect( buildStudioRedirectTo( undefined, { studioSiteId: STUDIO_SITE_ID } ) ).toContain(
			'/checkout/thank-you/no-site/:receiptId'
		);
	} );

	it( 'omits studioReturnTo when it was not supplied', () => {
		expect(
			buildStudioRedirectTo( 'example.wordpress.com', { studioSiteId: STUDIO_SITE_ID } )
		).not.toContain( 'studioReturnTo' );
	} );

	it( 'stays relative so it needs no redirect allowlist entry', () => {
		expect(
			buildStudioRedirectTo( 'example.wordpress.com', { studioSiteId: STUDIO_SITE_ID } )
		).toMatch( /^\/(?!\/)/ );
	} );
} );

describe( 'buildStudioCancelTo', () => {
	it( 'targets the dedicated return page', () => {
		const cancelTo = buildStudioCancelTo( {
			studioSiteId: STUDIO_SITE_ID,
			studioReturnTo: 'publish-site',
		} );

		const url = new URL( cancelTo, 'https://wordpress.com' );
		expect( url.pathname ).toBe( '/checkout/studio-return' );
		expect( url.searchParams.get( 'studioSiteId' ) ).toBe( STUDIO_SITE_ID );
		expect( url.searchParams.get( 'studioReturnTo' ) ).toBe( 'publish-site' );
	} );

	it( 'stays relative so it passes the cancel_to check in leaveCheckout', () => {
		expect( buildStudioCancelTo( { studioSiteId: STUDIO_SITE_ID } ) ).toMatch( /^\/(?!\/)/ );
	} );
} );
