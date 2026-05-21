/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import {
	getCachedPost,
	updateCachedPost,
	upsertPostCache,
	useCachedPost,
	useCachedPosts,
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

		upsertPostCache( queryClient, [ blogPost( 1 ) ] );

		expect( getCachedPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			ID: 1,
			site_ID: 100,
			title: 'Post 1',
		} );
	} );

	it( 'keeps local overlay values when older stream payloads are upserted later', () => {
		const queryClient = makeQueryClient();
		const postKey = { blogId: 100, postId: 1 };
		upsertPostCache( queryClient, [ blogPost( 1, { i_like: false, like_count: 0 } ) ] );

		updateCachedPost( queryClient, postKey, ( post ) => ( {
			i_like: true,
			like_count: Number( post?.like_count ?? 0 ) + 1,
		} ) );
		upsertPostCache( queryClient, [ blogPost( 1, { i_like: false, like_count: 0 } ) ] );

		expect( getCachedPost( queryClient, postKey ) ).toMatchObject( {
			i_like: true,
			like_count: 1,
		} );
	} );

	it( 'updates blog and feed aliases for the same post together', () => {
		const queryClient = makeQueryClient();
		const blogPostKey = { blogId: 100, postId: 1 };
		const feedPostKey = { feedId: 200, postId: 300 };
		upsertPostCache( queryClient, [
			blogPost( 1, { feed_ID: 200, feed_item_ID: 300, title: 'stream title' } ),
		] );

		updateCachedPost( queryClient, blogPostKey, () => ( {
			i_like: true,
			like_count: 1,
		} ) );
		upsertPostCache( queryClient, [
			blogPost( 1, { title: 'full title', content: '<p>Full post</p>' } ),
		] );

		expect( getCachedPost( queryClient, blogPostKey ) ).toMatchObject( {
			title: 'full title',
			content: '<p>Full post</p>',
			i_like: true,
			like_count: 1,
		} );
		expect( getCachedPost( queryClient, feedPostKey ) ).toMatchObject( {
			title: 'full title',
			content: '<p>Full post</p>',
			i_like: true,
			like_count: 1,
		} );
	} );

	it( 'creates feed aliases for every known feed item id', () => {
		const queryClient = makeQueryClient();

		upsertPostCache( queryClient, [
			blogPost( 1, { feed_ID: 200, feed_item_IDs: [ 300, 301 ] } ),
		] );

		expect( getCachedPost( queryClient, { feedId: 200, postId: 300 } ) ).toMatchObject( {
			ID: 1,
			site_ID: 100,
		} );
		expect( getCachedPost( queryClient, { feedId: 200, postId: 301 } ) ).toMatchObject( {
			ID: 1,
			site_ID: 100,
		} );
	} );

	it( 'does not create overlay-only cache entries for unseen posts', () => {
		const queryClient = makeQueryClient();
		const postKey = { blogId: 100, postId: 1 };

		updateCachedPost( queryClient, postKey, () => ( {
			i_like: true,
			like_count: 1,
		} ) );

		expect( getCachedPost( queryClient, postKey ) ).toBeNull();
	} );

	it( 'merges full post payloads over existing stream payloads', () => {
		const queryClient = makeQueryClient();
		const postKey = { blogId: 100, postId: 1 };
		upsertPostCache( queryClient, [ blogPost( 1, { title: 'stream title' } ) ] );

		upsertPostCache( queryClient, [
			blogPost( 1, { title: 'full title', content: '<p>Full post</p>' } ),
		] );

		expect( getCachedPost( queryClient, postKey ) ).toMatchObject( {
			title: 'full title',
			content: '<p>Full post</p>',
		} );
	} );

	it( 'updates nested discussion fields without dropping existing discussion data', () => {
		const queryClient = makeQueryClient();
		const postKey = { blogId: 100, postId: 1 };
		upsertPostCache( queryClient, [
			blogPost( 1, { discussion: { comment_count: 1, comments_open: true } } ),
		] );

		updateCachedPost( queryClient, postKey, () => ( {
			discussion: { comment_count: 2 },
		} ) );

		expect( getCachedPost( queryClient, postKey ) ).toMatchObject( {
			discussion: { comment_count: 2, comments_open: true },
		} );
	} );

	it( 'exposes canonical posts through useCachedPost', () => {
		const queryClient = makeQueryClient();
		upsertPostCache( queryClient, [ blogPost( 1 ) ] );

		const { result } = renderHook( () => useCachedPost( { blogId: 100, postId: 1 } ), {
			wrapper: makeWrapper( queryClient ),
		} );

		expect( result.current ).toMatchObject( { ID: 1, site_ID: 100 } );
	} );

	it( 'does not write null query data when observing an uncached post', async () => {
		const queryClient = makeQueryClient();
		const postKey = { blogId: 100, postId: 1 };

		renderHook( () => useCachedPost( postKey ), {
			wrapper: makeWrapper( queryClient ),
		} );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( getCachedPost( queryClient, postKey ) ).toBeNull();
	} );

	it( 'updates useCachedPost subscribers when cache data is written later', async () => {
		const queryClient = makeQueryClient();
		const postKey = { blogId: 100, postId: 1 };

		const { result } = renderHook( () => useCachedPost( postKey ), {
			wrapper: makeWrapper( queryClient ),
		} );

		expect( result.current ).toBeNull();

		upsertPostCache( queryClient, [ blogPost( 1 ) ] );

		await waitFor( () => {
			expect( result.current ).toMatchObject( { ID: 1, site_ID: 100 } );
		} );
	} );

	it( 'exposes dynamic cached post lists through useCachedPosts', async () => {
		const queryClient = makeQueryClient();
		const postKeys = [
			{ blogId: 100, postId: 1 },
			{ feedId: 200, postId: 300 },
		];

		const { result } = renderHook( () => useCachedPosts( postKeys ), {
			wrapper: makeWrapper( queryClient ),
		} );

		expect( result.current ).toEqual( [ null, null ] );

		upsertPostCache( queryClient, [
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
