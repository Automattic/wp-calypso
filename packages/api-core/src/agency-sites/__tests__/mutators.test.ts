import nock from 'nock';
import { provisionAgencySite } from '..';

const BASE = 'https://public-api.wordpress.com';

describe( 'provisionAgencySite', () => {
	afterEach( () => nock.cleanAll() );

	it( 'posts the configuration to the pending site provision endpoint', async () => {
		const params = { id: 7, site_name: 'example', php_version: '8.2' };
		const scope = nock( BASE )
			.post( '/wpcom/v2/agency/123/sites/7/provision', params )
			.reply( 200, { success: true } );

		await expect( provisionAgencySite( 123, params ) ).resolves.toEqual( { success: true } );
		expect( scope.isDone() ).toBe( true );
	} );
} );
