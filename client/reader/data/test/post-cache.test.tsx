/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import {
	getCachedReaderPost,
	updateCachedReaderPost,
	upsertReaderPostCache,
	useCachedReaderPost,
	useCachedReaderPosts,
} from '../post-cache';
import type { ReactNode } from 'react';

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

function makeWrapper( queryClient: QueryClient ) {
	return function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
	};
}

function blogPost( id: number, overrides: Record< string, unknown > = {} ) {
	return {
		ID: id,
		site_ID: 100,
		global_ID: `global-${ id }`,
		title: `Post ${ id }`,
		i_like: false,
		like_count: 0,
		discussion: { comment_count: 1 },
		...overrides,
	};
}

describe( 'reader post cache', () => {
	it( 'upserts stream posts into a canonical post cache', () => {
		const queryClient = makeQueryClient();

		upsertReaderPostCache( queryClient, [ blogPost( 1 ) ] );

		expect( getCachedReaderPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			ID: 1,
			site_ID: 100,
			title: 'Post 1',
		} );
	} );

	it( 'keeps local overlay values when older stream payloads are upserted later', () => {
		const queryClient = makeQueryClient();
		const postKey = { blogId: 100, postId: 1 };
		upsertReaderPostCache( queryClient, [ blogPost( 1, { i_like: false, like_count: 0 } ) ] );

		updateCachedReaderPost( queryClient, postKey, ( post ) => ( {
			i_like: true,
			like_count: Number( post?.like_count ?? 0 ) + 1,
		} ) );
		upsertReaderPostCache( queryClient, [ blogPost( 1, { i_like: false, like_count: 0 } ) ] );

		expect( getCachedReaderPost( queryClient, postKey ) ).toMatchObject( {
			i_like: true,
			like_count: 1,
		} );
	} );

	it( 'updates blog and feed aliases for the same post together', () => {
		const queryClient = makeQueryClient();
		const blogPostKey = { blogId: 100, postId: 1 };
		const feedPostKey = { feedId: 200, postId: 300 };
		upsertReaderPostCache( queryClient, [
			blogPost( 1, { feed_ID: 200, feed_item_ID: 300, title: 'stream title' } ),
		] );

		updateCachedReaderPost( queryClient, blogPostKey, () => ( {
			i_like: true,
			like_count: 1,
		} ) );
		upsertReaderPostCache( queryClient, [
			blogPost( 1, { title: 'full title', content: '<p>Full post</p>' } ),
		] );

		expect( getCachedReaderPost( queryClient, blogPostKey ) ).toMatchObject( {
			title: 'full title',
			content: '<p>Full post</p>',
			i_like: true,
			like_count: 1,
		} );
		expect( getCachedReaderPost( queryClient, feedPostKey ) ).toMatchObject( {
			title: 'full title',
			content: '<p>Full post</p>',
			i_like: true,
			like_count: 1,
		} );
	} );

	it( 'creates feed aliases for every known feed item id', () => {
		const queryClient = makeQueryClient();

		upsertReaderPostCache( queryClient, [
			blogPost( 1, { feed_ID: 200, feed_item_IDs: [ 300, 301 ] } ),
		] );

		expect( getCachedReaderPost( queryClient, { feedId: 200, postId: 300 } ) ).toMatchObject( {
			ID: 1,
			site_ID: 100,
		} );
		expect( getCachedReaderPost( queryClient, { feedId: 200, postId: 301 } ) ).toMatchObject( {
			ID: 1,
			site_ID: 100,
		} );
	} );

	it( 'does not create overlay-only cache entries for unseen posts', () => {
		const queryClient = makeQueryClient();
		const postKey = { blogId: 100, postId: 1 };

		updateCachedReaderPost( queryClient, postKey, () => ( {
			i_like: true,
			like_count: 1,
		} ) );

		expect( getCachedReaderPost( queryClient, postKey ) ).toBeNull();
	} );

	it( 'merges full post payloads over existing stream payloads', () => {
		const queryClient = makeQueryClient();
		const postKey = { blogId: 100, postId: 1 };
		upsertReaderPostCache( queryClient, [ blogPost( 1, { title: 'stream title' } ) ] );

		upsertReaderPostCache( queryClient, [
			blogPost( 1, { title: 'full title', content: '<p>Full post</p>' } ),
		] );

		expect( getCachedReaderPost( queryClient, postKey ) ).toMatchObject( {
			title: 'full title',
			content: '<p>Full post</p>',
		} );
	} );

	it( 'updates nested discussion fields without dropping existing discussion data', () => {
		const queryClient = makeQueryClient();
		const postKey = { blogId: 100, postId: 1 };
		upsertReaderPostCache( queryClient, [
			blogPost( 1, { discussion: { comment_count: 1, comments_open: true } } ),
		] );

		updateCachedReaderPost( queryClient, postKey, () => ( {
			discussion: { comment_count: 2 },
		} ) );

		expect( getCachedReaderPost( queryClient, postKey ) ).toMatchObject( {
			discussion: { comment_count: 2, comments_open: true },
		} );
	} );

	it( 'exposes canonical posts through useCachedReaderPost', () => {
		const queryClient = makeQueryClient();
		upsertReaderPostCache( queryClient, [ blogPost( 1 ) ] );

		const { result } = renderHook( () => useCachedReaderPost( { blogId: 100, postId: 1 } ), {
			wrapper: makeWrapper( queryClient ),
		} );

		expect( result.current ).toMatchObject( { ID: 1, site_ID: 100 } );
	} );

	it( 'does not write null query data when observing an uncached post', async () => {
		const queryClient = makeQueryClient();
		const postKey = { blogId: 100, postId: 1 };

		renderHook( () => useCachedReaderPost( postKey ), {
			wrapper: makeWrapper( queryClient ),
		} );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( getCachedReaderPost( queryClient, postKey ) ).toBeNull();
	} );

	it( 'updates useCachedReaderPost subscribers when cache data is written later', async () => {
		const queryClient = makeQueryClient();
		const postKey = { blogId: 100, postId: 1 };

		const { result } = renderHook( () => useCachedReaderPost( postKey ), {
			wrapper: makeWrapper( queryClient ),
		} );

		expect( result.current ).toBeNull();

		upsertReaderPostCache( queryClient, [ blogPost( 1 ) ] );

		await waitFor( () => {
			expect( result.current ).toMatchObject( { ID: 1, site_ID: 100 } );
		} );
	} );

	it( 'exposes dynamic cached post lists through useCachedReaderPosts', async () => {
		const queryClient = makeQueryClient();
		const postKeys = [
			{ blogId: 100, postId: 1 },
			{ feedId: 200, postId: 300 },
		];

		const { result } = renderHook( () => useCachedReaderPosts( postKeys ), {
			wrapper: makeWrapper( queryClient ),
		} );

		expect( result.current ).toEqual( [ null, null ] );

		upsertReaderPostCache( queryClient, [
			blogPost( 1 ),
			blogPost( 2, { feed_ID: 200, feed_item_ID: 300 } ),
		] );

		await waitFor( () => {
			expect( result.current ).toEqual( [
				expect.objectContaining( { ID: 1, site_ID: 100 } ),
				expect.objectContaining( { ID: 2, site_ID: 100, feed_ID: 200 } ),
			] );
		} );
	} );
} );
