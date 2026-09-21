import nock from 'nock';
import { createAgencySite, fetchAgencyPendingSites, fetchAgencySitesWithPlugins } from '..';

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

describe( 'fetchAgencyPendingSites', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches the sites the agency has paid for but not set up', async () => {
		const pendingSites = [
			{ id: 1, features: { wpcom_atomic: { state: 'pending', license_key: 'abc' } } },
		];
		const scope = nock( BASE )
			.get( '/wpcom/v2/agency/123/sites/pending' )
			.reply( 200, pendingSites );

		await expect( fetchAgencyPendingSites( 123 ) ).resolves.toEqual( pendingSites );
		expect( scope.isDone() ).toBe( true );
	} );
} );

describe( 'createAgencySite', () => {
	afterEach( () => nock.cleanAll() );

	it( 'brings a site the user owns under the agency', async () => {
		const scope = nock( BASE )
			.post( '/wpcom/v2/agency/123/sites', { blog_id: 456 } )
			.reply( 200, { success: true } );

		await expect( createAgencySite( 123, 456 ) ).resolves.toEqual( { success: true } );
		expect( scope.isDone() ).toBe( true );
	} );
} );
