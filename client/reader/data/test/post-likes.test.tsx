/**
 * @jest-environment jsdom
 */
import { postLikesQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { ReactNode } from 'react';
import { getCachedPost, upsertPostCache } from '../post-cache';
import { usePostLikeActions } from '../post-likes';

const BASE = 'https://public-api.wordpress.com';

const makeQueryClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

const makeWrapper = ( queryClient: QueryClient ) =>
	function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
	};

describe( 'usePostLikeActions', () => {
	afterEach( () => nock.cleanAll() );

	it( 'rolls back the Reader post cache optimistic update if the mutation fails after unmount', async () => {
		const queryClient = makeQueryClient();
		upsertPostCache( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				global_ID: 'global-1',
				i_like: true,
				like_count: '72',
			},
		] );
		queryClient.setQueryData( postLikesQuery( 100, 1 ).queryKey, {
			found: 72,
			iLike: true,
			likes: [ { ID: 1, login: 'alice' } ],
		} );

		const unlikeScope = nock( BASE )
			.post( '/rest/v1.1/sites/100/posts/1/likes/mine/delete', {} )
			.reply( 500, { error: 'oops' } );

		const { result, unmount } = renderHook( () => usePostLikeActions(), {
			wrapper: makeWrapper( queryClient ),
		} );

		result.current.unlike( 100, 1 );
		expect( getCachedPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			i_like: false,
			like_count: 71,
		} );

		unmount();

		await waitFor( () => expect( unlikeScope.isDone() ).toBe( true ) );
		await waitFor( () =>
			expect( getCachedPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
				i_like: true,
				like_count: '72',
			} )
		);
	} );

	it( 'keeps a full-post like optimistic update when an older stream payload is received later', async () => {
		const queryClient = makeQueryClient();
		upsertPostCache( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				global_ID: 'global-1',
				i_like: false,
				like_count: 72,
			},
		] );
		queryClient.setQueryData( postLikesQuery( 100, 1 ).queryKey, {
			found: 72,
			iLike: false,
			likes: [],
		} );

		const likeScope = nock( BASE )
			.post( '/rest/v1.1/sites/100/posts/1/likes/new', {} )
			.reply( 200, {
				success: true,
				like_count: '73',
				liker: { ID: 1, login: 'alice' },
			} );

		const { result } = renderHook( () => usePostLikeActions(), {
			wrapper: makeWrapper( queryClient ),
		} );

		result.current.like( 100, 1 );
		upsertPostCache( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				global_ID: 'global-1',
				i_like: false,
				like_count: 72,
			},
		] );

		expect( getCachedPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			i_like: true,
			like_count: 73,
		} );
		await waitFor( () => expect( likeScope.isDone() ).toBe( true ) );
	} );
} );
