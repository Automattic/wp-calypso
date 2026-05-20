/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import {
	getReaderPostEntity,
	updateReaderPostLocalState,
	upsertReaderPostEntities,
	useReaderPostEntity,
} from '../reader-post-entities';
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

describe( 'reader post entities', () => {
	it( 'upserts stream posts into a canonical post entity', () => {
		const queryClient = makeQueryClient();

		upsertReaderPostEntities( queryClient, [ blogPost( 1 ) ] );

		expect( getReaderPostEntity( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			ID: 1,
			site_ID: 100,
			title: 'Post 1',
		} );
	} );

	it( 'keeps local overlay values when older stream payloads are upserted later', () => {
		const queryClient = makeQueryClient();
		const postKey = { blogId: 100, postId: 1 };
		upsertReaderPostEntities( queryClient, [ blogPost( 1, { i_like: false, like_count: 0 } ) ] );

		updateReaderPostLocalState( queryClient, postKey, ( post ) => ( {
			i_like: true,
			like_count: Number( post?.like_count ?? 0 ) + 1,
		} ) );
		upsertReaderPostEntities( queryClient, [ blogPost( 1, { i_like: false, like_count: 0 } ) ] );

		expect( getReaderPostEntity( queryClient, postKey ) ).toMatchObject( {
			i_like: true,
			like_count: 1,
		} );
	} );

	it( 'updates blog and feed aliases for the same post together', () => {
		const queryClient = makeQueryClient();
		const blogPostKey = { blogId: 100, postId: 1 };
		const feedPostKey = { feedId: 200, postId: 300 };
		upsertReaderPostEntities( queryClient, [
			blogPost( 1, { feed_ID: 200, feed_item_ID: 300, title: 'stream title' } ),
		] );

		updateReaderPostLocalState( queryClient, blogPostKey, () => ( {
			i_like: true,
			like_count: 1,
		} ) );
		upsertReaderPostEntities( queryClient, [
			blogPost( 1, { title: 'full title', content: '<p>Full post</p>' } ),
		] );

		expect( getReaderPostEntity( queryClient, blogPostKey ) ).toMatchObject( {
			title: 'full title',
			content: '<p>Full post</p>',
			i_like: true,
			like_count: 1,
		} );
		expect( getReaderPostEntity( queryClient, feedPostKey ) ).toMatchObject( {
			title: 'full title',
			content: '<p>Full post</p>',
			i_like: true,
			like_count: 1,
		} );
	} );

	it( 'creates feed aliases for every known feed item id', () => {
		const queryClient = makeQueryClient();

		upsertReaderPostEntities( queryClient, [
			blogPost( 1, { feed_ID: 200, feed_item_IDs: [ 300, 301 ] } ),
		] );

		expect( getReaderPostEntity( queryClient, { feedId: 200, postId: 300 } ) ).toMatchObject( {
			ID: 1,
			site_ID: 100,
		} );
		expect( getReaderPostEntity( queryClient, { feedId: 200, postId: 301 } ) ).toMatchObject( {
			ID: 1,
			site_ID: 100,
		} );
	} );

	it( 'does not create overlay-only entities for unseen posts', () => {
		const queryClient = makeQueryClient();
		const postKey = { blogId: 100, postId: 1 };

		updateReaderPostLocalState( queryClient, postKey, () => ( {
			i_like: true,
			like_count: 1,
		} ) );

		expect( getReaderPostEntity( queryClient, postKey ) ).toBeNull();
	} );

	it( 'merges full post payloads over existing stream payloads', () => {
		const queryClient = makeQueryClient();
		const postKey = { blogId: 100, postId: 1 };
		upsertReaderPostEntities( queryClient, [ blogPost( 1, { title: 'stream title' } ) ] );

		upsertReaderPostEntities( queryClient, [
			blogPost( 1, { title: 'full title', content: '<p>Full post</p>' } ),
		] );

		expect( getReaderPostEntity( queryClient, postKey ) ).toMatchObject( {
			title: 'full title',
			content: '<p>Full post</p>',
		} );
	} );

	it( 'updates nested discussion fields without dropping existing discussion data', () => {
		const queryClient = makeQueryClient();
		const postKey = { blogId: 100, postId: 1 };
		upsertReaderPostEntities( queryClient, [
			blogPost( 1, { discussion: { comment_count: 1, comments_open: true } } ),
		] );

		updateReaderPostLocalState( queryClient, postKey, () => ( {
			discussion: { comment_count: 2 },
		} ) );

		expect( getReaderPostEntity( queryClient, postKey ) ).toMatchObject( {
			discussion: { comment_count: 2, comments_open: true },
		} );
	} );

	it( 'exposes canonical posts through useReaderPostEntity', () => {
		const queryClient = makeQueryClient();
		upsertReaderPostEntities( queryClient, [ blogPost( 1 ) ] );

		const { result } = renderHook( () => useReaderPostEntity( { blogId: 100, postId: 1 } ), {
			wrapper: makeWrapper( queryClient ),
		} );

		expect( result.current ).toMatchObject( { ID: 1, site_ID: 100 } );
	} );

	it( 'does not write null query data when observing an uncached post', async () => {
		const queryClient = makeQueryClient();
		const postKey = { blogId: 100, postId: 1 };

		renderHook( () => useReaderPostEntity( postKey ), {
			wrapper: makeWrapper( queryClient ),
		} );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( getReaderPostEntity( queryClient, postKey ) ).toBeNull();
	} );

	it( 'updates useReaderPostEntity subscribers when entity data is written later', async () => {
		const queryClient = makeQueryClient();
		const postKey = { blogId: 100, postId: 1 };

		const { result } = renderHook( () => useReaderPostEntity( postKey ), {
			wrapper: makeWrapper( queryClient ),
		} );

		expect( result.current ).toBeNull();

		upsertReaderPostEntities( queryClient, [ blogPost( 1 ) ] );

		await waitFor( () => {
			expect( result.current ).toMatchObject( { ID: 1, site_ID: 100 } );
		} );
	} );
} );
