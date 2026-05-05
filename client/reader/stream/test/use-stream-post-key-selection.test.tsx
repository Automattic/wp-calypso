/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useStreamPostKeySelection } from '../use-stream-post-key-selection';
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

function postKey( postId: number, blogId = 100 ): PostKey {
	return { blogId, postId };
}

const items = [ postKey( 1 ), postKey( 2 ), postKey( 3 ) ];

describe( 'useStreamPostKeySelection', () => {
	it( 'selects posts and computes previous/current/next from PostKey items', async () => {
		const queryClient = makeQueryClient();
		const { result } = renderHook(
			() => useStreamPostKeySelection( { streamKey: 'likes', items } ),
			{ wrapper: makeWrapper( queryClient ) }
		);

		expect( result.current.selectedPostKey ).toBeNull();
		expect( result.current.currentPostKey ).toBeNull();
		expect( result.current.previousPostKey ).toBeNull();
		expect( result.current.nextPostKey ).toBeNull();

		act( () => {
			result.current.selectPostKey( items[ 1 ] );
		} );

		await waitFor( () => expect( result.current.selectedPostKey ).toMatchObject( postKey( 2 ) ) );
		expect( result.current.currentPostKey ).toMatchObject( postKey( 2 ) );
		expect( result.current.previousPostKey ).toMatchObject( postKey( 1 ) );
		expect( result.current.nextPostKey ).toMatchObject( postKey( 3 ) );
	} );

	it( 'moves forward and backward through the item list', async () => {
		const queryClient = makeQueryClient();
		const { result } = renderHook(
			() => useStreamPostKeySelection( { streamKey: 'likes', items } ),
			{ wrapper: makeWrapper( queryClient ) }
		);

		act( () => {
			result.current.selectNextPost();
		} );
		await waitFor( () => expect( result.current.selectedPostKey ).toMatchObject( postKey( 1 ) ) );

		act( () => {
			result.current.selectNextPost();
		} );
		await waitFor( () => expect( result.current.selectedPostKey ).toMatchObject( postKey( 2 ) ) );

		act( () => {
			result.current.selectPreviousPost();
		} );
		await waitFor( () => expect( result.current.selectedPostKey ).toMatchObject( postKey( 1 ) ) );
	} );

	it( 'uses a controlled currentPostKey for previous/next without replacing cached selection', async () => {
		const queryClient = makeQueryClient();
		const { result, rerender } = renderHook(
			( { currentPostKey }: { currentPostKey?: PostKey } ) =>
				useStreamPostKeySelection( {
					streamKey: 'likes',
					items,
					currentPostKey,
				} ),
			{ wrapper: makeWrapper( queryClient ), initialProps: {} }
		);

		act( () => {
			result.current.selectPostKey( items[ 0 ] );
		} );
		await waitFor( () => expect( result.current.selectedPostKey ).toMatchObject( postKey( 1 ) ) );

		rerender( { currentPostKey: items[ 1 ] } );

		expect( result.current.selectedPostKey ).toMatchObject( postKey( 1 ) );
		expect( result.current.currentPostKey ).toMatchObject( postKey( 2 ) );
		expect( result.current.previousPostKey ).toMatchObject( postKey( 1 ) );
		expect( result.current.nextPostKey ).toMatchObject( postKey( 3 ) );
	} );

	it( 'matches the current item by xPostMetadata for full-post navigation', () => {
		const xpostItems: PostKey[] = [
			{ blogId: 100, postId: 1, xPostMetadata: { blogId: 200, postId: 2 } },
			postKey( 3 ),
		];
		const queryClient = makeQueryClient();
		const { result } = renderHook(
			() =>
				useStreamPostKeySelection( {
					streamKey: 'likes',
					items: xpostItems,
					currentPostKey: { blogId: 200, postId: 2 },
				} ),
			{ wrapper: makeWrapper( queryClient ) }
		);

		expect( result.current.currentPostKey ).toMatchObject( { blogId: 200, postId: 2 } );
		expect( result.current.previousPostKey ).toBeNull();
		expect( result.current.nextPostKey ).toMatchObject( postKey( 3 ) );
	} );

	it( 'keeps selection isolated per stream identity', async () => {
		const queryClient = makeQueryClient();
		const { result, rerender } = renderHook(
			( { streamKey }: { streamKey: string } ) => useStreamPostKeySelection( { streamKey, items } ),
			{ wrapper: makeWrapper( queryClient ), initialProps: { streamKey: 'likes' } }
		);

		act( () => {
			result.current.selectPostKey( items[ 1 ] );
		} );
		await waitFor( () => expect( result.current.selectedPostKey ).toMatchObject( postKey( 2 ) ) );

		rerender( { streamKey: 'following' } );
		expect( result.current.selectedPostKey ).toBeNull();

		act( () => {
			result.current.selectPostKey( items[ 2 ] );
		} );
		await waitFor( () => expect( result.current.selectedPostKey ).toMatchObject( postKey( 3 ) ) );

		rerender( { streamKey: 'likes' } );
		expect( result.current.selectedPostKey ).toMatchObject( postKey( 2 ) );
	} );

	it( 'derives previous/next from react-query cache when items are omitted', () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData( [ 'read', 'stream', 'infinite', 'likes', null, null ], {
			pages: [
				{
					posts: [
						{ ID: 1, site_ID: 100, date_liked: '2026-04-01T00:00:00Z' },
						{ ID: 2, site_ID: 100, date_liked: '2026-04-02T00:00:00Z' },
						{ ID: 3, site_ID: 100, date_liked: '2026-04-03T00:00:00Z' },
					],
					date_range: { after: null, before: null },
				},
			],
		} );

		const { result } = renderHook(
			() =>
				useStreamPostKeySelection( {
					streamKey: 'likes',
					currentPostKey: postKey( 2 ),
				} ),
			{ wrapper: makeWrapper( queryClient ) }
		);

		expect( result.current.currentPostKey ).toMatchObject( postKey( 2 ) );
		expect( result.current.previousPostKey ).toMatchObject( postKey( 1 ) );
		expect( result.current.nextPostKey ).toMatchObject( postKey( 3 ) );
	} );
} );
