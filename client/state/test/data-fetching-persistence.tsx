/**
 * @jest-environment jsdom
 */
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { render, waitFor } from '@testing-library/react';
import { shouldDehydrateQuery } from '../should-dehydrate-query';

const queryClient = new QueryClient();

const PERSISTENCE_KEY = 'REACT_QUERY_OFFLINE_CACHE';

const queryKey = '123';

const data = 'Hello, World!';

class Storage {
	cache: Map< string, string >;

	constructor() {
		this.cache = new Map();
	}

	getItem( key: string ) {
		return this.cache.get( key ) ?? null;
	}

	setItem( key: string, value: string ) {
		this.cache.set( key, value );
	}

	removeItem( key: string ) {
		this.cache.delete( key );
	}

	clear() {
		this.cache.clear();
	}

	get length() {
		return this.cache.size;
	}

	key() {
		return 'noop';
	}
}

const storage = new Storage();

const getOfflinePersistence = () => JSON.parse( storage.getItem( PERSISTENCE_KEY ) ?? '' );

const offlinePersister = createSyncStoragePersister( {
	storage,
	key: PERSISTENCE_KEY,
	throttleTime: 0,
} );

interface DataFetchingComponentProps< T > {
	queryFn(): Promise< T >;
	persistencePredicate?: boolean | ( ( data: T ) => boolean );
}

const DataFetchingComponent = < T, >( {
	queryFn,
	persistencePredicate,
}: DataFetchingComponentProps< T > ) => {
	const { status } = useQuery( {
		queryKey: [ queryKey ],
		queryFn,
		retry: false,
		meta: {
			persist: persistencePredicate != null ? persistencePredicate : undefined,
		},
	} );

	return <>{ status }</>;
};

const TestComponent = < T, >( dataFetchingProps: DataFetchingComponentProps< T > ) => {
	return (
		<QueryClientProvider client={ queryClient }>
			<DataFetchingComponent { ...dataFetchingProps } />
		</QueryClientProvider>
	);
};

describe( 'shouldDehydrateQuery', () => {
	beforeAll( async () => {
		await persistQueryClient( {
			queryClient,
			persister: offlinePersister,
			dehydrateOptions: {
				shouldDehydrateQuery,
			},
		} );
	} );

	beforeEach( () => {
		storage.clear();
		queryClient.clear();
	} );

	it( 'does not persist failed queries', async () => {
		const queryFn = () => Promise.reject( data );

		const { getByText } = render( <TestComponent queryFn={ queryFn } persistencePredicate /> );

		await waitFor( () => getByText( 'error' ) );

		const cache = await waitFor( () => getOfflinePersistence() );

		expect( cache ).toEqual(
			expect.objectContaining( {
				clientState: expect.objectContaining( {
					queries: [],
				} ),
			} )
		);
	} );

	describe( 'when passing `true` to `shouldPersistQuery`', () => {
		it( 'persists the query', async () => {
			const queryFn = () => Promise.resolve( data );

			const { getByText } = render( <TestComponent queryFn={ queryFn } persistencePredicate /> );

			await waitFor( () => getByText( 'success' ) );

			const cache = await waitFor( () => getOfflinePersistence() );

			expect( cache ).toEqual(
				expect.objectContaining( {
					clientState: expect.objectContaining( {
						queries: [
							expect.objectContaining( {
								state: expect.objectContaining( {
									data,
									status: 'success',
								} ),
								queryKey: [ queryKey ],
								queryHash: `["${ queryKey }"]`,
							} ),
						],
					} ),
				} )
			);
		} );
	} );

	describe( 'when passing `false` to `shouldPersistQuery`', () => {
		it( 'does not persist the query', async () => {
			const queryFn = () => Promise.resolve( data );

			const { getByText } = render(
				<TestComponent queryFn={ queryFn } persistencePredicate={ false } />
			);

			await waitFor( () => getByText( 'success' ) );

			const cache = await waitFor( () => getOfflinePersistence() );

			expect( cache ).toEqual(
				expect.objectContaining( {
					clientState: expect.objectContaining( {
						mutations: [],
						queries: [],
					} ),
				} )
			);
		} );
	} );

	describe( 'when passing a predicate to `shouldPersistQuery`', () => {
		it( 'persists the query if the condition is met', async () => {
			const queryFn = () => Promise.resolve( data );

			const { getByText } = render(
				<TestComponent queryFn={ queryFn } persistencePredicate={ () => true } />
			);

			await waitFor( () => getByText( 'success' ) );

			const cache = await waitFor( () => getOfflinePersistence() );

			expect( cache ).toEqual(
				expect.objectContaining( {
					clientState: expect.objectContaining( {
						queries: [
							expect.objectContaining( {
								state: expect.objectContaining( {
									data,
									status: 'success',
								} ),
								queryKey: [ queryKey ],
								queryHash: `["${ queryKey }"]`,
							} ),
						],
					} ),
				} )
			);
		} );

		it( 'does not persist the query if the condition is not met', async () => {
			const queryFn = () => Promise.resolve( data );

			const { getByText } = render(
				<TestComponent queryFn={ queryFn } persistencePredicate={ () => false } />
			);

			await waitFor( () => getByText( 'success' ) );

			const cache = await waitFor( () => getOfflinePersistence() );

			expect( cache ).toEqual(
				expect.objectContaining( {
					clientState: expect.objectContaining( {
						queries: [],
					} ),
				} )
			);
		} );
	} );
} );
