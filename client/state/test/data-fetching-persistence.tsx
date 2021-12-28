/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom/extend-expect';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import { createWebStoragePersistor } from 'react-query/createWebStoragePersistor-experimental';
import { persistQueryClient } from 'react-query/persistQueryClient-experimental';
import { shouldDehydrateQuery } from '../should-dehydrate-query';

const queryClient = new QueryClient();

const PERSISTENCE_KEY = 'REACT_QUERY_OFFLINE_CACHE';

const queryKey = '123';

class Storage {
	cache: Map< string, string >;

	constructor() {
		this.cache = new Map();
	}

	getItem( key: string ) {
		return this.cache.get( key );
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

const getOfflinePersistence = () => JSON.parse( storage.getItem( PERSISTENCE_KEY ) );

const offlinePersistor = createWebStoragePersistor( {
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
	const { status } = useQuery( queryKey, queryFn, {
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
			persistor: offlinePersistor,
			dehydrateOptions: {
				shouldDehydrateQuery,
			},
		} );
	} );

	afterEach( () => {
		storage.clear();
	} );

	describe( 'when passing `true` to `shouldPersistQuery`', () => {
		it( 'persists the query', async () => {
			const data = 'Hello, World!';

			const queryFn = () => Promise.resolve( data );

			const { getByText } = render(
				<TestComponent queryFn={ queryFn } persistencePredicate={ true } />
			);

			await waitFor( () => getByText( 'success' ) );

			const cache = await waitFor( () => getOfflinePersistence() );

			expect( cache ).toEqual(
				expect.objectContaining( {
					buster: '',
					timestamp: expect.any( Number ),
					clientState: {
						mutations: [],
						queries: [
							{
								state: {
									data: 'Hello, World!',
									dataUpdateCount: expect.any( Number ),
									dataUpdatedAt: expect.any( Number ),
									error: null,
									errorUpdateCount: 0,
									errorUpdatedAt: 0,
									fetchFailureCount: 0,
									fetchMeta: null,
									isFetching: false,
									isInvalidated: false,
									isPaused: false,
									status: 'success',
								},
								queryKey: '123',
								queryHash: '["123"]',
							},
						],
					},
				} )
			);
		} );
	} );
} );
