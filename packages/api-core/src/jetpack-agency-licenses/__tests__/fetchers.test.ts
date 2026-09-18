import nock from 'nock';
import { fetchJetpackAgencyDevLicenses, fetchJetpackLicenses } from '..';

const BASE = 'https://public-api.wordpress.com';

describe( 'fetchJetpackLicenses', () => {
	afterEach( () => nock.cleanAll() );

	it( 'accumulates every page of results and stops at the last page', async () => {
		const page1 = nock( BASE )
			.get( '/wpcom/v2/jetpack-licensing/licenses' )
			.query( ( q ) => q.page === '1' )
			.reply( 200, { items: [ { license_id: 1 }, { license_id: 2 } ], total_pages: 2 } );

		const page2 = nock( BASE )
			.get( '/wpcom/v2/jetpack-licensing/licenses' )
			.query( ( q ) => q.page === '2' )
			.reply( 200, { items: [ { license_id: 3 } ], total_pages: 2 } );

		const licenses = await fetchJetpackLicenses( 123, {
			filter: 'all',
			sortField: 'issued_at',
			sortDirection: 'desc',
		} );

		expect( licenses.map( ( license ) => license.license_id ) ).toEqual( [ 1, 2, 3 ] );
		expect( page1.isDone() ).toBe( true );
		expect( page2.isDone() ).toBe( true );
	} );

	it( 'passes the agency id, filter, sort, and search as query params', async () => {
		const scope = nock( BASE )
			.get( '/wpcom/v2/jetpack-licensing/licenses' )
			.query( ( q ) => {
				return (
					q.agency_id === '123' &&
					q.filter === 'attached' &&
					q.search === 'woopayments' &&
					q.sort_field === 'issued_at' &&
					q.sort_direction === 'desc' &&
					q.per_page === '100'
				);
			} )
			.reply( 200, { items: [], total_pages: 1 } );

		await fetchJetpackLicenses( 123, {
			filter: 'attached',
			search: 'woopayments',
			sortField: 'issued_at',
			sortDirection: 'desc',
		} );

		expect( scope.isDone() ).toBe( true );
	} );
} );

describe( 'fetchJetpackAgencyDevLicenses', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches the remaining free development licenses for the agency', async () => {
		const response = { licenses: [ { license_id: 1 } ], available: 4 };
		const scope = nock( BASE )
			.get( '/wpcom/v2/jetpack-licensing/dev-licenses' )
			.query( ( q ) => q.agency_id === '123' )
			.reply( 200, response );

		await expect( fetchJetpackAgencyDevLicenses( 123 ) ).resolves.toEqual( response );
		expect( scope.isDone() ).toBe( true );
	} );
} );
