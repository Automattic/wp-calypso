import nock from 'nock';
import { fetchAgencySitesWithPlugins, fetchPendingAgencySites } from '..';

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
