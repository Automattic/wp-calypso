import { filterPersistedQueryClientState } from '../query-client';

describe( 'filterPersistedQueryClientState', () => {
	it( 'removes persisted Reader infinite stream queries', () => {
		const persistedClient = {
			timestamp: Date.now(),
			buster: '',
			clientState: {
				mutations: [],
				queries: [
					{
						queryHash: 'reader-stream',
						queryKey: [ 'read', 'stream', 'infinite', 'following', null, null, null ],
						state: { status: 'success' },
					},
					{
						queryHash: 'site-query',
						queryKey: [ 'site', 123 ],
						state: { status: 'success' },
					},
				],
			},
		};

		expect(
			filterPersistedQueryClientState( persistedClient as never )?.clientState.queries
		).toEqual( [ expect.objectContaining( { queryHash: 'site-query' } ) ] );
	} );
} );
