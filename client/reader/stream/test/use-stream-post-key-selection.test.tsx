/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createStreamItemFromPost } from 'calypso/state/reader/streams/normalize';
import { useStreamPostKeySelection } from '../use-stream-post-key-selection';
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

const items: PostKey[] = streamResponse.posts.map( ( post ) =>
	createStreamItemFromPost( post, 'date' )
);

const FIRST = items[ 0 ];
const SECOND = items[ 1 ];
const THIRD = items[ 2 ];

describe( 'useStreamPostKeySelection', () => {
	it( 'navigates from the first to the second post via selectNextPost', async () => {
		const queryClient = makeQueryClient();
		const { result } = renderHook(
			() => useStreamPostKeySelection( { streamKey: 'following', items } ),
			{ wrapper: makeWrapper( queryClient ) }
		);

		expect( result.current.selectedPostKey ).toBeNull();
		expect( result.current.nextPostKey ).toBeNull();

		act( () => {
			result.current.selectPostKey( FIRST );
		} );

		await waitFor( () =>
			expect( result.current.selectedPostKey ).toMatchObject( {
				feedId: FIRST.feedId,
				postId: FIRST.postId,
			} )
		);
		expect( result.current.nextPostKey ).toMatchObject( {
			feedId: SECOND.feedId,
			postId: SECOND.postId,
		} );
		expect( result.current.previousPostKey ).toBeNull();

		act( () => {
			result.current.selectNextPost();
		} );

		await waitFor( () =>
			expect( result.current.selectedPostKey ).toMatchObject( {
				feedId: SECOND.feedId,
				postId: SECOND.postId,
			} )
		);
		expect( result.current.previousPostKey ).toMatchObject( {
			feedId: FIRST.feedId,
			postId: FIRST.postId,
		} );
		expect( result.current.nextPostKey ).toMatchObject( {
			feedId: THIRD.feedId,
			postId: THIRD.postId,
		} );
	} );

	it( 'walks the whole list forward via selectNextPost and back via selectPreviousPost', async () => {
		const queryClient = makeQueryClient();
		const { result } = renderHook(
			() => useStreamPostKeySelection( { streamKey: 'following', items } ),
			{ wrapper: makeWrapper( queryClient ) }
		);

		act( () => {
			result.current.selectPostKey( FIRST );
		} );
		await waitFor( () =>
			expect( result.current.selectedPostKey ).toMatchObject( {
				feedId: FIRST.feedId,
				postId: FIRST.postId,
			} )
		);

		for ( let i = 1; i < items.length; i++ ) {
			act( () => {
				result.current.selectNextPost();
			} );
			const expected = { feedId: items[ i ].feedId, postId: items[ i ].postId };
			await waitFor( () => expect( result.current.selectedPostKey ).toMatchObject( expected ) );
		}
		expect( result.current.nextPostKey ).toBeNull();

		for ( let i = items.length - 2; i >= 0; i-- ) {
			act( () => {
				result.current.selectPreviousPost();
			} );
			const expected = { feedId: items[ i ].feedId, postId: items[ i ].postId };
			await waitFor( () => expect( result.current.selectedPostKey ).toMatchObject( expected ) );
		}
		expect( result.current.previousPostKey ).toBeNull();
	} );

	it( 'matches the current item by xPostMetadata', () => {
		// `SECOND` is mid-list and has a valid `xpost_origin`; addressing it
		// via the xPostMetadata target should still resolve to it (and to
		// FIRST/THIRD as prev/next).
		const xMeta = SECOND.xPostMetadata as { blogId: number; postId: number };
		expect( xMeta?.blogId ).toBeTruthy();
		expect( xMeta?.postId ).toBeTruthy();

		const queryClient = makeQueryClient();
		const { result } = renderHook(
			() =>
				useStreamPostKeySelection( {
					streamKey: 'following',
					items,
					currentPostKey: { blogId: xMeta.blogId, postId: xMeta.postId },
				} ),
			{ wrapper: makeWrapper( queryClient ) }
		);

		expect( result.current.previousPostKey ).toMatchObject( {
			feedId: FIRST.feedId,
			postId: FIRST.postId,
		} );
		expect( result.current.nextPostKey ).toMatchObject( {
			feedId: THIRD.feedId,
			postId: THIRD.postId,
		} );
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
			expect( result.current.selectedPostKey ).toMatchObject( {
				feedId: FIRST.feedId,
				postId: FIRST.postId,
			} )
		);

		rerender( { currentPostKey: SECOND } );

		expect( result.current.selectedPostKey ).toMatchObject( {
			feedId: FIRST.feedId,
			postId: FIRST.postId,
		} );
		expect( result.current.currentPostKey ).toMatchObject( {
			feedId: SECOND.feedId,
			postId: SECOND.postId,
		} );
		expect( result.current.previousPostKey ).toMatchObject( {
			feedId: FIRST.feedId,
			postId: FIRST.postId,
		} );
		expect( result.current.nextPostKey ).toMatchObject( {
			feedId: THIRD.feedId,
			postId: THIRD.postId,
		} );
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
			expect( result.current.selectedPostKey ).toMatchObject( {
				feedId: SECOND.feedId,
				postId: SECOND.postId,
			} )
		);

		rerender( { streamKey: 'a8c' } );
		expect( result.current.selectedPostKey ).toBeNull();

		act( () => {
			result.current.selectPostKey( THIRD );
		} );
		await waitFor( () =>
			expect( result.current.selectedPostKey ).toMatchObject( {
				feedId: THIRD.feedId,
				postId: THIRD.postId,
			} )
		);

		rerender( { streamKey: 'following' } );
		expect( result.current.selectedPostKey ).toMatchObject( {
			feedId: SECOND.feedId,
			postId: SECOND.postId,
		} );
	} );

	it( 'derives previous/next from the react-query cache when items are omitted', () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData( [ 'read', 'stream', 'infinite', 'following', null, null, null ], {
			pages: [ streamResponse ],
		} );

		const post = streamResponse.posts[ 4 ];
		const { result } = renderHook(
			() =>
				useStreamPostKeySelection( {
					streamKey: 'following',
					currentPostKey: { feedId: post.feed_ID, postId: post.feed_item_ID },
				} ),
			{ wrapper: makeWrapper( queryClient ) }
		);

		expect( result.current.previousPostKey ).toMatchObject( {
			feedId: items[ 3 ].feedId,
			postId: items[ 3 ].postId,
		} );
		expect( result.current.nextPostKey ).toMatchObject( {
			feedId: items[ 5 ].feedId,
			postId: items[ 5 ].postId,
		} );
	} );
} );
