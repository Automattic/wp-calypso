import { QueryClient, dehydrate, onlineManager } from '@tanstack/react-query';
import { dehydrateOptions } from '../dehydrate-options';
import { siteScanEnqueuedQuery } from '../site-scan';

describe( 'cache persistence', () => {
	test( 'persists queries but not a mutation left paused by going offline', async () => {
		const client = new QueryClient();

		await client.prefetchQuery( { queryKey: [ 'thing' ], queryFn: () => 'value' } );

		onlineManager.setOnline( false );
		try {
			const mutation = client
				.getMutationCache()
				.build( client, { mutationFn: () => Promise.resolve( 'ok' ) } );
			// Never settles while offline, and is not awaited: pausing is the point.
			mutation.execute( undefined ).catch( () => {} );
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
			expect( mutation.state.isPaused ).toBe( true );

			const dehydrated = dehydrate( client, dehydrateOptions );

			// Nothing can resume it after a reload, and restoring it would hold its scope forever.
			expect( dehydrated.mutations ).toHaveLength( 0 );
			// The queries it travels with are unaffected.
			expect( dehydrated.queries ).toHaveLength( 1 );
		} finally {
			onlineManager.setOnline( true );
		}
	} );
} );

describe( 'scan enqueued persistence', () => {
	const siteId = 1;
	const { queryKey } = siteScanEnqueuedQuery( siteId );

	function persistedKeys( client: QueryClient ) {
		return dehydrate( client, dehydrateOptions ).queries.map( ( query ) => query.queryKey );
	}

	test( 'does not persist a scan request the server has not accepted yet', () => {
		const client = new QueryClient();
		client.getQueryCache().build( client, siteScanEnqueuedQuery( siteId ) );
		client.setQueryData( queryKey, { at: 1, confirmed: false } );

		expect( persistedKeys( client ) ).not.toContainEqual( queryKey );
	} );

	test( 'persists a scan request once the server has accepted it', () => {
		const client = new QueryClient();
		client.getQueryCache().build( client, siteScanEnqueuedQuery( siteId ) );
		client.setQueryData( queryKey, { at: 1, confirmed: true } );

		expect( persistedKeys( client ) ).toContainEqual( queryKey );
	} );
} );
