import {
	getAgencyCheckoutParams,
	getAllowedDashboardUrl,
	parseAgencyCartEntries,
} from '../agency-checkout-params';

describe( 'parseAgencyCartEntries', () => {
	it( 'reads one entry per product with its quantity and billing product id', () => {
		expect(
			parseAgencyCartEntries( 'wpcom-hosting-business:3:1010,jetpack-backup-t1:1:2010' )
		).toEqual( [
			{ slug: 'wpcom-hosting-business', quantity: 3, productId: 1010 },
			{ slug: 'jetpack-backup-t1', quantity: 1, productId: 2010 },
		] );
	} );

	it( 'counts a missing or invalid quantity as one', () => {
		expect(
			parseAgencyCartEntries( 'jetpack-backup-t1::2010,jetpack-scan:abc:2011,jetpack-boost:0:2012' )
		).toEqual( [
			{ slug: 'jetpack-backup-t1', quantity: 1, productId: 2010 },
			{ slug: 'jetpack-scan', quantity: 1, productId: 2011 },
			{ slug: 'jetpack-boost', quantity: 1, productId: 2012 },
		] );
	} );

	it( 'drops a line without a billing product id', () => {
		expect( parseAgencyCartEntries( 'jetpack-backup-t1:1,jetpack-scan:1:abc,:1:2010' ) ).toEqual(
			[]
		);
	} );

	it( 'returns nothing for an empty param', () => {
		expect( parseAgencyCartEntries( null ) ).toEqual( [] );
		expect( parseAgencyCartEntries( '' ) ).toEqual( [] );
		expect( parseAgencyCartEntries( ',' ) ).toEqual( [] );
	} );
} );

describe( 'getAllowedDashboardUrl', () => {
	it( 'accepts the dashboard hosts', () => {
		expect(
			getAllowedDashboardUrl( 'https://agencies-beta.automattic.com/marketplace/purchases' )
		).toBe( 'https://agencies-beta.automattic.com/marketplace/purchases' );
		expect( getAllowedDashboardUrl( 'http://my.a4a.localhost:3000/marketplace/products' ) ).toBe(
			'http://my.a4a.localhost:3000/marketplace/products'
		);
		expect( getAllowedDashboardUrl( 'https://abc123-a4a.calypso.live/marketplace/hosting' ) ).toBe(
			'https://abc123-a4a.calypso.live/marketplace/hosting'
		);
	} );

	it( 'rejects other hosts, other schemes and relative paths', () => {
		expect( getAllowedDashboardUrl( 'https://example.com/marketplace/purchases' ) ).toBeUndefined();
		expect( getAllowedDashboardUrl( 'https://agencies.automattic.com/purchases' ) ).toBeUndefined();
		expect(
			getAllowedDashboardUrl( 'javascript://agencies-beta.automattic.com/%0aalert(1)' )
		).toBeUndefined();
		expect( getAllowedDashboardUrl( '/marketplace/purchases' ) ).toBeUndefined();
		expect( getAllowedDashboardUrl( null ) ).toBeUndefined();
	} );
} );

describe( 'getAgencyCheckoutParams', () => {
	it( 'reads the agency, the cart and both return URLs from the query string', () => {
		const params = getAgencyCheckoutParams(
			'?agency_id=123&products=wpcom-hosting-business%3A2%3A1010&redirect_to=' +
				encodeURIComponent(
					'https://agencies-beta.automattic.com/marketplace/purchases?receipt_id=:receiptId'
				) +
				'&cancel_to=' +
				encodeURIComponent( 'https://agencies-beta.automattic.com/marketplace/hosting/wpcom' )
		);
		expect( params ).toEqual( {
			agencyId: 123,
			entries: [ { slug: 'wpcom-hosting-business', quantity: 2, productId: 1010 } ],
			redirectTo:
				'https://agencies-beta.automattic.com/marketplace/purchases?receipt_id=:receiptId',
			cancelTo: 'https://agencies-beta.automattic.com/marketplace/hosting/wpcom',
		} );
	} );

	it( 'falls back to the dashboard Purchases page when the return URL is missing or not allowed', () => {
		const { agencyId, redirectTo, cancelTo } = getAgencyCheckoutParams(
			'?products=jetpack-backup-t1%3A1%3A2010&redirect_to=https%3A%2F%2Fexample.com%2F&cancel_to=https%3A%2F%2Fexample.com%2F'
		);
		expect( agencyId ).toBe( 0 );
		expect( new URL( redirectTo ).pathname ).toBe( '/marketplace/purchases' );
		expect( cancelTo ).toBeUndefined();
	} );
} );
