import { QueryClient, dehydrate, onlineManager } from '@tanstack/react-query';
import { dehydrateOptions } from '../dehydrate-options';

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
