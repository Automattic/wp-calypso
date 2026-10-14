/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import useUsersQuery, { getUsersQueryKey } from '../use-users-query';

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

const get = jest.requireMock( 'calypso/lib/wp' ).req.get;

const user = ( ID ) => ( { ID, login: `user${ ID }` } );

function createWrapper() {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
	const wrapper = ( { children } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);
	return { wrapper, queryClient };
}

describe( 'getUsersQueryKey', () => {
	it( 'keeps the users/site prefix for invalidation', () => {
		expect( getUsersQueryKey( 1, { search: '*a*' } ).slice( 0, 2 ) ).toEqual( [ 'users', 1 ] );
	} );

	it( 'gives the same key for equivalent options', () => {
		expect( getUsersQueryKey( 1, {} ) ).toEqual( getUsersQueryKey( 1, { number: 100 } ) );
		expect( getUsersQueryKey( 1, { search: undefined } ) ).toEqual( getUsersQueryKey( 1 ) );
		expect( getUsersQueryKey( 1, { a: 1, b: 2 } ) ).toEqual(
			getUsersQueryKey( 1, { b: 2, a: 1 } )
		);
	} );

	it( 'gives different keys when the request differs', () => {
		expect( getUsersQueryKey( 1, { include_viewers: true } ) ).not.toEqual(
			getUsersQueryKey( 1, { include_viewers: false } )
		);
		expect( getUsersQueryKey( 1, { authors_only: 1 } ) ).not.toEqual( getUsersQueryKey( 1 ) );
		expect( getUsersQueryKey( 1, { number: 20 } ) ).not.toEqual( getUsersQueryKey( 1 ) );
	} );
} );

describe( 'useUsersQuery', () => {
	beforeEach( () => {
		get.mockReset();
	} );

	it( 'keeps callers with different fetch options in separate cache entries', async () => {
		get.mockImplementation( ( path, params ) =>
			Promise.resolve(
				params.include_viewers
					? { found: 2, users: [ user( 1 ), user( 2 ) ] }
					: { found: 1, users: [ user( 1 ) ] }
			)
		);
		const { wrapper } = createWrapper();

		const withViewers = renderHook( () => useUsersQuery( 1, { include_viewers: true } ), {
			wrapper,
		} );
		const withoutViewers = renderHook( () => useUsersQuery( 1, { include_viewers: false } ), {
			wrapper,
		} );

		await waitFor( () => expect( withViewers.result.current.data?.users ).toHaveLength( 2 ) );
		await waitFor( () => expect( withoutViewers.result.current.data?.users ).toHaveLength( 1 ) );
		expect( get ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'reports the server count while more pages remain', async () => {
		get.mockResolvedValue( { found: 250, users: [ user( 1 ), user( 2 ) ] } );
		const { wrapper } = createWrapper();

		const { result } = renderHook( () => useUsersQuery( 1, { number: 2 } ), { wrapper } );

		await waitFor( () => expect( result.current.data ).toBeDefined() );
		expect( result.current.data.total ).toBe( 250 );
		expect( result.current.hasNextPage ).toBe( true );
	} );

	it( 'reports the deduplicated count once every page is loaded', async () => {
		get
			.mockResolvedValueOnce( { found: 4, users: [ user( 1 ), user( 2 ) ] } )
			.mockResolvedValueOnce( { found: 4, users: [ user( 2 ), user( 3 ) ] } );
		const { wrapper } = createWrapper();

		const { result } = renderHook( () => useUsersQuery( 1, { number: 2 } ), { wrapper } );

		await waitFor( () => expect( result.current.data?.total ).toBe( 4 ) );
		await result.current.fetchNextPage();
		await waitFor( () => expect( result.current.hasNextPage ).toBe( false ) );
		expect( result.current.data.users.map( ( u ) => u.ID ) ).toEqual( [ 1, 2, 3 ] );
		expect( result.current.data.total ).toBe( 3 );
	} );

	it( 'is invalidated by the users/site prefix', async () => {
		get.mockResolvedValue( { found: 1, users: [ user( 1 ) ] } );
		const { wrapper, queryClient } = createWrapper();

		const { result } = renderHook( () => useUsersQuery( 1, { authors_only: 1 } ), { wrapper } );
		await waitFor( () => expect( result.current.data ).toBeDefined() );

		await queryClient.invalidateQueries( { queryKey: [ 'users', 1 ] } );

		await waitFor( () => expect( get ).toHaveBeenCalledTimes( 2 ) );
	} );
} );
