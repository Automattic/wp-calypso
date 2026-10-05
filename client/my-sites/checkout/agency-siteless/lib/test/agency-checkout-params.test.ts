import {
	getAgencyCheckoutParams,
	getAllowedA4ADashboardUrl,
	parseAgencyCartEntries,
} from '../agency-checkout-params';

describe( 'parseAgencyCartEntries', () => {
	it( 'reads one entry per product with its quantity', () => {
		expect( parseAgencyCartEntries( 'wpcom-hosting-business:3,jetpack-backup-t1:1' ) ).toEqual( [
			{ slug: 'wpcom-hosting-business', quantity: 3 },
			{ slug: 'jetpack-backup-t1', quantity: 1 },
		] );
	} );

	it( 'reads the site a PHP memory add-on applies to', () => {
		expect(
			parseAgencyCartEntries(
				'pressable-addon-php-memory-512:1:one.example.com,pressable-addon-php-memory-512:1:two%2Eexample.com'
			)
		).toEqual( [
			{ slug: 'pressable-addon-php-memory-512', quantity: 1, siteDomain: 'one.example.com' },
			{ slug: 'pressable-addon-php-memory-512', quantity: 1, siteDomain: 'two.example.com' },
		] );
	} );

	it( 'leaves out a site that cannot be decoded', () => {
		expect( parseAgencyCartEntries( 'pressable-addon-php-memory-512:1:%zz' ) ).toEqual( [
			{ slug: 'pressable-addon-php-memory-512', quantity: 1 },
		] );
	} );

	it( 'counts a missing or invalid quantity as one and skips entries without a product', () => {
		expect(
			parseAgencyCartEntries( 'jetpack-backup-t1,jetpack-scan:abc,jetpack-boost:0,,:1' )
		).toEqual( [
			{ slug: 'jetpack-backup-t1', quantity: 1 },
			{ slug: 'jetpack-scan', quantity: 1 },
			{ slug: 'jetpack-boost', quantity: 1 },
		] );
		expect( parseAgencyCartEntries( null ) ).toEqual( [] );
		expect( parseAgencyCartEntries( '' ) ).toEqual( [] );
	} );

	it( 'brings a quantity above the cart limit down to it', () => {
		expect( parseAgencyCartEntries( 'jetpack-backup-t1:1000000' ) ).toEqual( [
			{ slug: 'jetpack-backup-t1', quantity: 100 },
		] );
	} );
} );

describe( 'getAllowedA4ADashboardUrl', () => {
	it( 'accepts the dashboard hosts', () => {
		expect( getAllowedA4ADashboardUrl( 'https://agencies-beta.automattic.com/purchases' ) ).toBe(
			'https://agencies-beta.automattic.com/purchases'
		);
		expect( getAllowedA4ADashboardUrl( 'http://my.a4a.localhost:3000/products' ) ).toBe(
			'http://my.a4a.localhost:3000/products'
		);
		expect( getAllowedA4ADashboardUrl( 'https://abc123-a4a.calypso.live/hosting' ) ).toBe(
			'https://abc123-a4a.calypso.live/hosting'
		);
	} );

	it( 'rejects other hosts, other schemes and relative paths', () => {
		expect( getAllowedA4ADashboardUrl( 'https://example.com/purchases' ) ).toBeUndefined();
		expect(
			getAllowedA4ADashboardUrl( 'https://agencies.automattic.com/purchases' )
		).toBeUndefined();
		expect(
			getAllowedA4ADashboardUrl( 'javascript://agencies-beta.automattic.com/%0aalert(1)' )
		).toBeUndefined();
		expect( getAllowedA4ADashboardUrl( '/purchases' ) ).toBeUndefined();
		expect( getAllowedA4ADashboardUrl( null ) ).toBeUndefined();
	} );
} );

describe( 'getAgencyCheckoutParams', () => {
	it( 'reads the cart, the term and both return URLs from the query string', () => {
		const params = getAgencyCheckoutParams(
			'?products=wpcom-hosting-business%3A2&term=monthly&redirect_to=' +
				encodeURIComponent(
					'https://agencies-beta.automattic.com/purchases?receipt_id=:receiptId'
				) +
				'&cancel_to=' +
				encodeURIComponent( 'https://agencies-beta.automattic.com/hosting/wpcom' )
		);
		expect( params ).toEqual( {
			entries: [ { slug: 'wpcom-hosting-business', quantity: 2 } ],
			term: 'monthly',
			redirectTo: 'https://agencies-beta.automattic.com/purchases?receipt_id=:receiptId',
			cancelTo: 'https://agencies-beta.automattic.com/hosting/wpcom',
		} );
	} );

	it( 'bills yearly unless the link asks for monthly', () => {
		expect( getAgencyCheckoutParams( '?products=jetpack-backup-t1%3A1' ).term ).toBe( 'yearly' );
		expect( getAgencyCheckoutParams( '?products=jetpack-backup-t1%3A1&term=weekly' ).term ).toBe(
			'yearly'
		);
	} );

	it( 'falls back to the dashboard Purchases page when the return URL is missing or not allowed', () => {
		const { redirectTo, cancelTo } = getAgencyCheckoutParams(
			'?products=jetpack-backup-t1%3A1&redirect_to=https%3A%2F%2Fexample.com%2F&cancel_to=https%3A%2F%2Fexample.com%2F'
		);
		expect( new URL( redirectTo ).pathname ).toBe( '/purchases' );
		expect( cancelTo ).toBeUndefined();
	} );
} );
