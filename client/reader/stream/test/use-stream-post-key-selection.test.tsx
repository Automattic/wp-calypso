/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createStreamItemFromPost } from 'calypso/state/reader/streams/normalize';
import { samePostIdentity, useStreamPostKeySelection } from '../use-stream-post-key-selection';
import streamResponse from './fixtures/following-stream-response.json';
import type { PostKey } from '../use-stream-posts';
import type { ReactNode } from 'react';

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

function makeWrapper( queryClient: QueryClient ) {
	return function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
	};
}

// Run the real wpcom payload through the same pipeline the production hook
// uses. Each item ends up as
//   { feedId, postId: feed_item_ID, globalId, xPostMetadata, ... }
// because every post in the fixture has `feed_ID && feed_item_ID`.
const items: PostKey[] = streamResponse.posts.map( ( post ) =>
	createStreamItemFromPost( post, 'date' )
);

const FIRST = items[ 0 ];
const SECOND = items[ 1 ];
const THIRD = items[ 2 ];

describe( 'useStreamPostKeySelection', () => {
	it( 'samePostIdentity matches the same post by globalId', () => {
		expect( samePostIdentity( FIRST, FIRST ) ).toBe( true );
		expect( samePostIdentity( FIRST, SECOND ) ).toBe( false );
		// Different tuples, same globalId → still identical.
		expect(
			samePostIdentity(
				{ feedId: FIRST.feedId, postId: FIRST.postId, globalId: FIRST.globalId },
				{ blogId: 999, postId: 9999, globalId: FIRST.globalId }
			)
		).toBe( true );
	} );

	it( 'navigates from the first to the second post via selectNextPost', async () => {
		const queryClient = makeQueryClient();
		const { result } = renderHook(
			() => useStreamPostKeySelection( { streamKey: 'following', items } ),
			{ wrapper: makeWrapper( queryClient ) }
		);

		// Nothing selected yet — `nextPostKey` is null until the user picks
		// an anchor (the keyboard `j` shortcut anchors to the visible item
		// in `<ReaderStream>` before delegating to the hook).
		expect( result.current.selectedPostKey ).toBeNull();
		expect( result.current.nextPostKey ).toBeNull();

		// User clicks the first card.
		act( () => {
			result.current.selectPostKey( FIRST );
		} );

		await waitFor( () =>
			expect( result.current.selectedPostKey?.globalId ).toBe( FIRST.globalId )
		);
		// Prev/next return the stream items themselves — full identity
		// including `globalId`. X-post URL redirection happens downstream
		// in `showSelectedPost`.
		expect( result.current.nextPostKey?.globalId ).toBe( SECOND.globalId );
		expect( result.current.previousPostKey ).toBeNull();

		// User presses `j` — selection advances to the second stream item.
		act( () => {
			result.current.selectNextPost();
		} );

		await waitFor( () =>
			expect( result.current.selectedPostKey?.globalId ).toBe( SECOND.globalId )
		);
		expect( result.current.previousPostKey?.globalId ).toBe( FIRST.globalId );
		expect( result.current.nextPostKey?.globalId ).toBe( THIRD.globalId );
	} );

	it( 'walks the whole list forward via selectNextPost and back via selectPreviousPost', async () => {
		const queryClient = makeQueryClient();
		const { result } = renderHook(
			() => useStreamPostKeySelection( { streamKey: 'following', items } ),
			{ wrapper: makeWrapper( queryClient ) }
		);

		// Anchor on the first item.
		act( () => {
			result.current.selectPostKey( FIRST );
		} );
		await waitFor( () =>
			expect( result.current.selectedPostKey?.globalId ).toBe( FIRST.globalId )
		);

		// Forward through the rest of the list.
		for ( let i = 1; i < items.length; i++ ) {
			act( () => {
				result.current.selectNextPost();
			} );
			const expected = items[ i ].globalId;
			await waitFor( () => expect( result.current.selectedPostKey?.globalId ).toBe( expected ) );
		}
		// At the tail there's no further next.
		expect( result.current.nextPostKey ).toBeNull();

		// And back to the head.
		for ( let i = items.length - 2; i >= 0; i-- ) {
			act( () => {
				result.current.selectPreviousPost();
			} );
			const expected = items[ i ].globalId;
			await waitFor( () => expect( result.current.selectedPostKey?.globalId ).toBe( expected ) );
		}
		expect( result.current.previousPostKey ).toBeNull();
	} );

	it( 'matches the URL-derived current key by globalId when items are keyed by {feedId, postId}', () => {
		// `<ReaderFullPost>` derives the URL key as `{blogId, postId}` (route
		// is `/reader/blogs/:blog/posts/:post`) and enriches it with the
		// hydrated `globalId` from Redux. Stream items here are keyed by
		// `{feedId, postId: feed_item_ID, globalId}` — different tuple,
		// same identity via `globalId`.
		const post = streamResponse.posts[ 1 ];
		const urlDerivedKey: PostKey = {
			blogId: post.site_ID,
			postId: post.ID,
			globalId: post.global_ID,
		};

		const queryClient = makeQueryClient();
		const { result } = renderHook(
			() =>
				useStreamPostKeySelection( {
					streamKey: 'following',
					items,
					currentPostKey: urlDerivedKey,
				} ),
			{ wrapper: makeWrapper( queryClient ) }
		);

		expect( result.current.previousPostKey?.globalId ).toBe( FIRST.globalId );
		expect( result.current.nextPostKey?.globalId ).toBe( THIRD.globalId );
	} );

	it( 'falls back to the {feedId, postId} tuple when globalId is missing on the current key', () => {
		// Window between route change and Redux hydration: URL params known,
		// `getPostByKey` still returns undefined → no `globalId` on the
		// controlled key yet. Identity must still match through the legacy
		// tuple (`keysAreEqual`).
		const post = streamResponse.posts[ 2 ];
		const urlDerivedKey: PostKey = {
			feedId: post.feed_ID,
			postId: post.feed_item_ID,
		};

		const queryClient = makeQueryClient();
		const { result } = renderHook(
			() =>
				useStreamPostKeySelection( {
					streamKey: 'following',
					items,
					currentPostKey: urlDerivedKey,
				} ),
			{ wrapper: makeWrapper( queryClient ) }
		);

		expect( result.current.previousPostKey?.globalId ).toBe( items[ 1 ].globalId );
		expect( result.current.nextPostKey?.globalId ).toBe( items[ 3 ].globalId );
	} );

	it( 'uses a controlled currentPostKey for prev/next without replacing the cached selection', async () => {
		const queryClient = makeQueryClient();
		const { result, rerender } = renderHook(
			( { currentPostKey }: { currentPostKey?: PostKey } ) =>
				useStreamPostKeySelection( {
					streamKey: 'following',
					items,
					currentPostKey,
				} ),
			{ wrapper: makeWrapper( queryClient ), initialProps: {} }
		);

		act( () => {
			result.current.selectPostKey( FIRST );
		} );
		await waitFor( () =>
			expect( result.current.selectedPostKey?.globalId ).toBe( FIRST.globalId )
		);

		// `<ReaderFullPost>` pins `currentPostKey` to the second item. The
		// cached selection (the highlighted card in `<Stream>`) stays on
		// the first; only prev/next reflect the URL anchor.
		rerender( { currentPostKey: SECOND } );

		expect( result.current.selectedPostKey?.globalId ).toBe( FIRST.globalId );
		expect( result.current.currentPostKey?.globalId ).toBe( SECOND.globalId );
		expect( result.current.previousPostKey?.globalId ).toBe( FIRST.globalId );
		expect( result.current.nextPostKey?.globalId ).toBe( THIRD.globalId );
	} );

	it( 'keeps selection isolated per stream identity', async () => {
		const queryClient = makeQueryClient();
		const { result, rerender } = renderHook(
			( { streamKey }: { streamKey: string } ) => useStreamPostKeySelection( { streamKey, items } ),
			{ wrapper: makeWrapper( queryClient ), initialProps: { streamKey: 'following' } }
		);

		act( () => {
			result.current.selectPostKey( SECOND );
		} );
		await waitFor( () =>
			expect( result.current.selectedPostKey?.globalId ).toBe( SECOND.globalId )
		);

		// Switching streams resets selection — each streamKey owns its
		// `selectedPostKey` slot in the React Query cache.
		rerender( { streamKey: 'a8c' } );
		expect( result.current.selectedPostKey ).toBeNull();

		act( () => {
			result.current.selectPostKey( THIRD );
		} );
		await waitFor( () =>
			expect( result.current.selectedPostKey?.globalId ).toBe( THIRD.globalId )
		);

		// Switching back restores the prior selection for `following`.
		rerender( { streamKey: 'following' } );
		expect( result.current.selectedPostKey?.globalId ).toBe( SECOND.globalId );
	} );

	it( 'derives previous/next from the react-query cache when items are omitted', () => {
		// `<ReaderFullPost>` mounts without passing explicit `items` —
		// the hook reaches into the infinite-stream cache to find the
		// list the user came from, so prev/next still resolve.
		const queryClient = makeQueryClient();
		queryClient.setQueryData( [ 'read', 'stream', 'infinite', 'following', null, null, null ], {
			pages: [ streamResponse ],
		} );

		const post = streamResponse.posts[ 4 ];
		const { result } = renderHook(
			() =>
				useStreamPostKeySelection( {
					streamKey: 'following',
					currentPostKey: {
						feedId: post.feed_ID,
						postId: post.feed_item_ID,
						globalId: post.global_ID,
					},
				} ),
			{ wrapper: makeWrapper( queryClient ) }
		);

		expect( result.current.previousPostKey?.globalId ).toBe( items[ 3 ].globalId );
		expect( result.current.nextPostKey?.globalId ).toBe( items[ 5 ].globalId );
	} );
} );
