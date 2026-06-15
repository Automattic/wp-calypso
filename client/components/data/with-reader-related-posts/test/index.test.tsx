/*
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { useRelatedPosts } from '../index';
import type { ReactNode } from 'react';

const mockPosts = [
	{
		ID: 11,
		site_ID: 1,
		global_ID: 'g11',
		content: '<p>First <strong>related</strong> post</p>',
	},
	{ ID: 12, site_ID: 1, global_ID: 'g12', content: '<p>Second related post</p>' },
];

const getQueryClient = () => {
	const instance = new QueryClient();
	instance.setDefaultOptions( { queries: { retry: false } } );
	return instance;
};

const getWrapper =
	( queryClient = getQueryClient() ) =>
	( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

describe( 'useRelatedPosts', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'returns normalized related post objects', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/site/1/post/2/related' )
			.query( true )
			.reply( 200, { posts: mockPosts } );

		const { result } = renderHook( () => useRelatedPosts( 1, 2, 'same' ), {
			wrapper: getWrapper(),
		} );

		await waitFor( () => {
			expect( result.current.posts?.map( ( post ) => post.better_excerpt_no_html ) ).toEqual( [
				'First related post',
				'Second related post',
			] );
		} );
	} );

	it( 'returns undefined posts when a cold request fails', async () => {
		const scope = nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/site/1/post/2/related' )
			.query( true )
			.reply( 500, { message: 'Internal Server Error' } );

		const { result } = renderHook( () => useRelatedPosts( 1, 2, 'same' ), {
			wrapper: getWrapper(),
		} );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		await waitFor( () => expect( result.current.posts ).toBeUndefined() );
		expect( result.current.isError ).toBe( true );
	} );

	it( 'returns an empty posts array when the request succeeds with no related posts', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/site/1/post/2/related' )
			.query( true )
			.reply( 200, { posts: [] } );

		const { result } = renderHook( () => useRelatedPosts( 1, 2, 'same' ), {
			wrapper: getWrapper(),
		} );

		await waitFor( () => expect( result.current.posts ).toEqual( [] ) );
	} );

	it( 'keeps cached posts visible across transient refetch errors', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/site/1/post/2/related' )
			.query( true )
			.reply( 200, { posts: mockPosts } );

		const queryClient = getQueryClient();
		const { result } = renderHook( () => useRelatedPosts( 1, 2, 'same' ), {
			wrapper: getWrapper( queryClient ),
		} );

		await waitFor( () => expect( result.current.posts ).toHaveLength( 2 ) );

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/site/1/post/2/related' )
			.query( true )
			.reply( 500, { message: 'Internal Server Error' } );

		await act( async () => {
			await result.current.refetch();
		} );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );
		expect( result.current.posts?.map( ( post ) => post.better_excerpt_no_html ) ).toEqual( [
			'First related post',
			'Second related post',
		] );
	} );
} );
