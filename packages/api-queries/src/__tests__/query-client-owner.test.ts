import { clearQueryClient, queryClient, validateQueryCacheOwner } from '../query-client';

const CACHE_KEY = 'REACT_QUERY_OFFLINE_CACHE';
const OWNER_KEY = 'REACT_QUERY_CACHE_OWNER';

describe( 'validateQueryCacheOwner', () => {
	beforeEach( () => {
		localStorage.clear();
		queryClient.getQueryCache().clear();
		queryClient.getMutationCache().clear();
	} );

	it( 'stamps the owner and clears the cache on first run', () => {
		localStorage.setItem( CACHE_KEY, 'stale-cache' );
		queryClient.setQueryData( [ 'sites' ], [ { ID: 1 } ] );

		validateQueryCacheOwner( 123 );

		expect( localStorage.getItem( CACHE_KEY ) ).toBeNull();
		expect( queryClient.getQueryData( [ 'sites' ] ) ).toBeUndefined();
		expect( localStorage.getItem( OWNER_KEY ) ).toBe( '123' );
	} );

	it( 'keeps the cache when the owner matches', () => {
		localStorage.setItem( OWNER_KEY, '123' );
		localStorage.setItem( CACHE_KEY, 'own-cache' );
		queryClient.setQueryData( [ 'sites' ], [ { ID: 1 } ] );

		validateQueryCacheOwner( 123 );

		expect( localStorage.getItem( CACHE_KEY ) ).toBe( 'own-cache' );
		expect( queryClient.getQueryData( [ 'sites' ] ) ).toEqual( [ { ID: 1 } ] );
	} );

	it( 'clears the persisted and in-memory caches when the owner differs', () => {
		localStorage.setItem( OWNER_KEY, '123' );
		localStorage.setItem( CACHE_KEY, 'previous-user-cache' );
		queryClient.setQueryData( [ 'sites' ], [ { ID: 1 } ] );

		validateQueryCacheOwner( 456 );

		expect( localStorage.getItem( CACHE_KEY ) ).toBeNull();
		expect( queryClient.getQueryData( [ 'sites' ] ) ).toBeUndefined();
		expect( localStorage.getItem( OWNER_KEY ) ).toBe( '456' );
	} );

	it( 'keeps pending queries when clearing', async () => {
		localStorage.setItem( OWNER_KEY, '123' );
		queryClient.setQueryData( [ 'sites' ], [ { ID: 1 } ] );
		let resolveFetch: ( value: string ) => void = () => {};
		const pending = queryClient.fetchQuery( {
			queryKey: [ 'auth', 'user' ],
			queryFn: () => new Promise< string >( ( resolve ) => ( resolveFetch = resolve ) ),
		} );

		validateQueryCacheOwner( 456 );

		expect( queryClient.getQueryData( [ 'sites' ] ) ).toBeUndefined();
		expect( queryClient.getQueryCache().find( { queryKey: [ 'auth', 'user' ] } ) ).toBeDefined();
		resolveFetch( 'user' );
		await expect( pending ).resolves.toBe( 'user' );
	} );
} );

describe( 'clearQueryClient', () => {
	it( 'removes the cache and the owner key', () => {
		localStorage.setItem( CACHE_KEY, 'cache' );
		localStorage.setItem( OWNER_KEY, '123' );

		clearQueryClient();

		expect( localStorage.getItem( CACHE_KEY ) ).toBeNull();
		expect( localStorage.getItem( OWNER_KEY ) ).toBeNull();
	} );
} );
