/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import useDeleteUserMutation from '../use-delete-user-mutation';
import useUsersQuery from '../use-users-query';

const mockGet = jest.fn();
const mockPost = jest.fn();
jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: ( ...args: unknown[] ) => mockGet( ...args ),
		post: ( ...args: unknown[] ) => mockPost( ...args ),
	},
} ) );

function renderUsers( pages: { users: { ID: number; display_name: string }[]; found: number }[] ) {
	const queryClient = new QueryClient();
	const data = { pages, pageParams: pages.map( ( _, index ) => index * 100 ) };
	queryClient.setQueryData( [ 'users', 123, {} ], data );
	const wrapper = ( { children }: { children: ReactNode } ) =>
		createElement( QueryClientProvider, { client: queryClient }, children );
	const hook = renderHook( () => useUsersQuery( 123, {}, { enabled: false } ), { wrapper } );
	return { ...hook, queryClient, data };
}

describe( 'useUsersQuery', () => {
	beforeEach( () => {
		mockGet.mockReset();
		mockPost.mockReset();
	} );

	it( 'isolates simultaneous user lists with different role filters', async () => {
		mockGet.mockImplementation( ( _, options ) =>
			Promise.resolve( {
				users: [
					{
						ID: options.authors_only ? 1 : 2,
						display_name: options.authors_only ? 'Author' : 'Administrator',
					},
				],
				found: 1,
			} )
		);
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const wrapper = ( { children }: { children: ReactNode } ) =>
			createElement( QueryClientProvider, { client: queryClient }, children );
		const { result } = renderHook(
			() => ( {
				authors: useUsersQuery( 123, { authors_only: 1 } ),
				administrators: useUsersQuery( 123, { role: 'administrator' } ),
			} ),
			{ wrapper }
		);

		await waitFor( () => {
			expect( result.current.authors.data?.users ).toEqual( [ { ID: 1, display_name: 'Author' } ] );
			expect( result.current.administrators.data?.users ).toEqual( [
				{ ID: 2, display_name: 'Administrator' },
			] );
		} );
		expect( mockGet ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'invalidates every list for the deleted user’s site while retaining other sites', async () => {
		mockPost.mockResolvedValue( {} );
		const queryClient = new QueryClient();
		const keys = [
			[ 'users', 123, { authors_only: 1 } ],
			[ 'users', 123, { role: 'administrator' } ],
			[ 'users', 456, {} ],
		];
		keys.forEach( ( key ) => queryClient.setQueryData( key, { pages: [], pageParams: [] } ) );
		const wrapper = ( { children }: { children: ReactNode } ) =>
			createElement( QueryClientProvider, { client: queryClient }, children );
		const { result } = renderHook( () => useDeleteUserMutation( 123 ), { wrapper } );

		act( () => {
			result.current.deleteUser( 1, {} );
		} );
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( keys.map( ( key ) => queryClient.getQueryState( key )?.isInvalidated ) ).toEqual( [
			true,
			true,
			false,
		] );
	} );

	it( 'keeps the first user for duplicate IDs across pages without modifying cached pages', () => {
		const firstUser = { ID: 1, display_name: 'First role' };
		const secondUser = { ID: 2, display_name: 'Second user' };
		const pages = [
			{ users: [ firstUser, { ID: 1, display_name: 'Other role' } ], found: 4 },
			{ users: [ secondUser, { ID: 1, display_name: 'Viewer role' } ], found: 4 },
		];
		const { result, queryClient, data } = renderUsers( pages );

		expect( result.current.data?.users ).toEqual( [ firstUser, secondUser ] );
		expect( result.current.data?.users[ 0 ] ).toBe( firstUser );
		expect( result.current.data?.total ).toBe( 2 );
		expect( result.current.data?.pages ).toBe( pages );
		expect( result.current.data?.pageParams ).toBe( data.pageParams );
		expect( queryClient.getQueryData( [ 'users', 123, {} ] ) ).toEqual( data );
		expect( pages.map( ( page ) => page.users.length ) ).toEqual( [ 2, 2 ] );
	} );

	it( 'reports zero loaded users for an empty page', () => {
		const { result } = renderUsers( [ { users: [], found: 0 } ] );

		expect( result.current.data?.users ).toEqual( [] );
		expect( result.current.data?.total ).toBe( 0 );
	} );
} );
