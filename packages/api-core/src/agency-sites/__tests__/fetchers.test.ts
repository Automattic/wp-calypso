import nock from 'nock';
import {
	fetchAgencySitesWithPlugins,
	fetchPendingAgencySites,
	validateAgencySiteAddress,
} from '..';

const BASE = 'https://public-api.wordpress.com';

describe( 'fetchAgencySitesWithPlugins', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches the agency sites filtered by plugin', async () => {
		const sites = [ { id: 1, url: 'https://a.example', state: 'active', blog_id: 11 } ];
		const scope = nock( BASE )
			.get( '/wpcom/v2/agency/123/sites' )
			.query( true )
			.reply( 200, sites );

		await expect(
			fetchAgencySitesWithPlugins( 123, [ 'woocommerce-payments/woocommerce-payments' ] )
		).resolves.toEqual( sites );
		expect( scope.isDone() ).toBe( true );
	} );
} );

describe( 'fetchPendingAgencySites', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches the pending sites for the agency', async () => {
		const pendingSites = [
			{ id: 7, features: { wpcom_atomic: { license_key: 'abc-123', state: 'pending' } } },
		];
		const scope = nock( BASE )
			.get( '/wpcom/v2/agency/123/sites/pending' )
			.reply( 200, pendingSites );

		await expect( fetchPendingAgencySites( 123 ) ).resolves.toEqual( pendingSites );
		expect( scope.isDone() ).toBe( true );
	} );
} );

describe( 'validateAgencySiteAddress', () => {
	afterEach( () => nock.cleanAll() );

	it( 'posts the address as a free wordpress.com blog subdomain', async () => {
		const scope = nock( BASE )
			.post( '/wpcom/v2/agency/123/validate-site-address', {
				site_name: 'example',
				domain: 'wordpress.com',
				type: 'blog',
			} )
			.reply( 200, { valid: true } );

		await expect( validateAgencySiteAddress( 123, 'example' ) ).resolves.toEqual( { valid: true } );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'reports an address that is taken', async () => {
		nock( BASE )
			.post( '/wpcom/v2/agency/123/validate-site-address' )
			.reply( 200, { valid: false } );

		await expect( validateAgencySiteAddress( 123, 'taken' ) ).resolves.toEqual( { valid: false } );
	} );
} );
