import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { likePostMutation, postLikesQuery, unlikePostMutation } from '../post-likes';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';

const makeWrapper = ( client: QueryClient ) =>
	function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};

const newClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

describe( 'postLikesQuery', () => {
	afterEach( () => nock.cleanAll() );

	it( 'uses a memory-only per-post query key', () => {
		expect( postLikesQuery( 123, 456 ).queryKey ).toEqual( [
			'sites',
			123,
			'posts',
			456,
			'likes',
		] );
		expect( postLikesQuery( 123, 456 ).meta ).toEqual( { persist: false } );
	} );

	it( 'refreshes active likes queries on the legacy interval', () => {
		expect( postLikesQuery( 123, 456 ).refetchInterval ).toBe( 120001 );
	} );
} );

describe( 'post like mutations', () => {
	afterEach( () => nock.cleanAll() );

	it( 'optimistically unlikes without letting the later response restore a stale count', async () => {
		nock( BASE )
			.post( '/rest/v1.1/sites/123/posts/456/likes/mine/delete', {} )
			.reply( 200, {
				success: true,
				like_count: '72',
				liker: { ID: 1, login: 'alice' },
			} );

		const client = newClient();
		client.setQueryData( postLikesQuery( 123, 456 ).queryKey, {
			found: 72,
			iLike: true,
			likes: [ { ID: 1, login: 'alice' } ],
		} );

		const { result } = renderHook( () => useMutation( unlikePostMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		let promise: Promise< unknown > | undefined;
		act( () => {
			promise = result.current.mutateAsync( { siteId: 123, postId: 456 } );
		} );

		await waitFor( () =>
			expect( client.getQueryData( postLikesQuery( 123, 456 ).queryKey ) ).toMatchObject( {
				found: 71,
				iLike: false,
			} )
		);

		await act( async () => {
			await promise;
		} );

		expect( client.getQueryData( postLikesQuery( 123, 456 ).queryKey ) ).toMatchObject( {
			found: 71,
			iLike: false,
			likes: [],
		} );
	} );

	it( 'rolls back an optimistic like on error', async () => {
		nock( BASE ).post( '/rest/v1.1/sites/123/posts/456/likes/new', {} ).reply( 500, {
			error: 'oops',
		} );

		const client = newClient();
		client.setQueryData( postLikesQuery( 123, 456 ).queryKey, {
			found: 72,
			iLike: false,
			likes: [],
		} );

		const { result } = renderHook( () => useMutation( likePostMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await expect(
				result.current.mutateAsync( { siteId: 123, postId: 456 } )
			).rejects.toBeDefined();
		} );

		expect( client.getQueryData( postLikesQuery( 123, 456 ).queryKey ) ).toEqual( {
			found: 72,
			iLike: false,
			likes: [],
		} );
	} );

	it( 'removes optimistic data on error when there was no previous cache entry', async () => {
		nock( BASE ).post( '/rest/v1.1/sites/123/posts/456/likes/new', {} ).reply( 500, {
			error: 'oops',
		} );

		const client = newClient();
		const { result } = renderHook( () => useMutation( likePostMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await expect(
				result.current.mutateAsync( { siteId: 123, postId: 456 } )
			).rejects.toBeDefined();
		} );

		expect( client.getQueryData( postLikesQuery( 123, 456 ).queryKey ) ).toBeUndefined();
	} );

	it( 'uses the API like count on like success while avoiding duplicate likers', async () => {
		nock( BASE )
			.post( '/rest/v1.1/sites/123/posts/456/likes/new', {} )
			.reply( 200, {
				success: true,
				like_count: '73',
				liker: { ID: 1, login: 'alice' },
			} );

		const client = newClient();
		client.setQueryData( postLikesQuery( 123, 456 ).queryKey, {
			found: 50,
			iLike: false,
			likes: [ { ID: 1, login: 'alice' } ],
		} );

		const { result } = renderHook( () => useMutation( likePostMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await result.current.mutateAsync( { siteId: 123, postId: 456 } );
		} );

		expect( client.getQueryData( postLikesQuery( 123, 456 ).queryKey ) ).toEqual( {
			found: 73,
			iLike: true,
			likes: [ { ID: 1, login: 'alice' } ],
		} );
	} );

	it( 'optimistically likes before the API responds', async () => {
		nock( BASE )
			.post( '/rest/v1.1/sites/123/posts/456/likes/new', {} )
			.delay( 100 )
			.reply( 200, {
				success: true,
				like_count: '73',
				liker: { ID: 1, login: 'alice' },
			} );

		const client = newClient();
		client.setQueryData( postLikesQuery( 123, 456 ).queryKey, {
			found: 72,
			iLike: false,
			likes: [],
		} );

		const { result } = renderHook( () => useMutation( likePostMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		let promise: Promise< unknown > | undefined;
		act( () => {
			promise = result.current.mutateAsync( { siteId: 123, postId: 456 } );
		} );

		await waitFor( () =>
			expect( client.getQueryData( postLikesQuery( 123, 456 ).queryKey ) ).toMatchObject( {
				found: 73,
				iLike: true,
			} )
		);

		await act( async () => {
			await promise;
		} );
	} );

	it( 'rolls back an optimistic unlike on error', async () => {
		nock( BASE ).post( '/rest/v1.1/sites/123/posts/456/likes/mine/delete', {} ).reply( 500, {
			error: 'oops',
		} );

		const client = newClient();
		client.setQueryData( postLikesQuery( 123, 456 ).queryKey, {
			found: 72,
			iLike: true,
			likes: [ { ID: 1, login: 'alice' } ],
		} );

		const { result } = renderHook( () => useMutation( unlikePostMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await expect(
				result.current.mutateAsync( { siteId: 123, postId: 456 } )
			).rejects.toBeDefined();
		} );

		expect( client.getQueryData( postLikesQuery( 123, 456 ).queryKey ) ).toEqual( {
			found: 72,
			iLike: true,
			likes: [ { ID: 1, login: 'alice' } ],
		} );
	} );

	it( 'does not refetch likes while an unlike request is still pending', async () => {
		const postScope = nock( BASE )
			.post( '/rest/v1.1/sites/123/posts/456/likes/mine/delete', {} )
			.delay( 100 )
			.reply( 200, {
				success: true,
				like_count: '71',
				liker: { ID: 1, login: 'alice' },
			} );
		const refetchScope = nock( BASE ).get( '/rest/v1.1/sites/123/posts/456/likes' ).reply( 200, {
			found: 71,
			i_like: false,
			likes: [],
		} );

		const client = newClient();
		client.setQueryData( postLikesQuery( 123, 456 ).queryKey, {
			found: 72,
			iLike: true,
			likes: [ { ID: 1, login: 'alice' } ],
		} );

		const { result } = renderHook(
			() => ( {
				likesQuery: useQuery( postLikesQuery( 123, 456 ) ),
				unlikeMutation: useMutation( unlikePostMutation( client ) ),
			} ),
			{ wrapper: makeWrapper( client ) }
		);

		let promise: Promise< unknown > | undefined;
		act( () => {
			promise = result.current.unlikeMutation.mutateAsync( { siteId: 123, postId: 456 } );
		} );

		await waitFor( () =>
			expect( client.getQueryData( postLikesQuery( 123, 456 ).queryKey ) ).toMatchObject( {
				found: 71,
				iLike: false,
			} )
		);
		expect( refetchScope.isDone() ).toBe( false );

		await act( async () => {
			await promise;
		} );

		await waitFor( () => expect( postScope.isDone() ).toBe( true ) );
		await waitFor( () => expect( refetchScope.isDone() ).toBe( true ) );
	} );

	it( 'does not refetch likes while another mutation for the same post is still pending', async () => {
		const likeScope = nock( BASE )
			.post( '/rest/v1.1/sites/123/posts/456/likes/new', {} )
			.delay( 50 )
			.reply( 200, {
				success: true,
				like_count: '73',
				liker: { ID: 1, login: 'alice' },
			} );
		const unlikeScope = nock( BASE )
			.post( '/rest/v1.1/sites/123/posts/456/likes/mine/delete', {} )
			.delay( 150 )
			.reply( 200, {
				success: true,
				like_count: '72',
				liker: { ID: 1, login: 'alice' },
			} );
		const refetchScope = nock( BASE ).get( '/rest/v1.1/sites/123/posts/456/likes' ).reply( 200, {
			found: 72,
			i_like: false,
			likes: [],
		} );

		const client = newClient();
		client.setQueryData( postLikesQuery( 123, 456 ).queryKey, {
			found: 72,
			iLike: false,
			likes: [],
		} );

		const { result } = renderHook(
			() => ( {
				likesQuery: useQuery( postLikesQuery( 123, 456 ) ),
				likeMutation: useMutation( likePostMutation( client ) ),
				unlikeMutation: useMutation( unlikePostMutation( client ) ),
			} ),
			{ wrapper: makeWrapper( client ) }
		);

		let likePromise: Promise< unknown > | undefined;
		let unlikePromise: Promise< unknown > | undefined;
		act( () => {
			likePromise = result.current.likeMutation.mutateAsync( { siteId: 123, postId: 456 } );
			unlikePromise = result.current.unlikeMutation.mutateAsync( { siteId: 123, postId: 456 } );
		} );

		await act( async () => {
			await likePromise;
		} );
		expect( likeScope.isDone() ).toBe( true );
		expect( refetchScope.isDone() ).toBe( false );

		await act( async () => {
			await unlikePromise;
		} );

		await waitFor( () => expect( unlikeScope.isDone() ).toBe( true ) );
		await waitFor( () => expect( refetchScope.isDone() ).toBe( true ) );
	} );
} );
