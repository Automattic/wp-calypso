import { QueryClient, dehydrate } from '@tanstack/react-query';
import { pendingAgencySitesQuery, provisionedAgencySitesQuery } from '../agency-sites';
import { dehydrateOptions } from '../dehydrate-options';

describe( 'pendingAgencySitesQuery', () => {
	test( 'is left out of the persisted cache', async () => {
		const client = new QueryClient();

		await client.prefetchQuery( { ...pendingAgencySitesQuery( 1 ), queryFn: () => [] } );

		expect( dehydrate( client, dehydrateOptions ).queries ).toHaveLength( 0 );
	} );
} );

describe( 'provisionedAgencySitesQuery', () => {
	test( 'is left out of the persisted cache', async () => {
		const client = new QueryClient();

		await client.prefetchQuery( { ...provisionedAgencySitesQuery( 1 ), queryFn: () => [] } );

		expect( dehydrate( client, dehydrateOptions ).queries ).toHaveLength( 0 );
	} );
} );
