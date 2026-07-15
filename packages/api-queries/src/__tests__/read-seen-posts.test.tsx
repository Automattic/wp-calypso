import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import nock from 'nock';
import { patchSubscriptionSeenCount } from '../read-follows';
import {
	markAllReaderPostsAsSeenMutation,
	markReaderPostsAsSeenMutation,
	markReaderPostsAsUnseenMutation,
	markReaderWpcomPostsAsSeenMutation,
	markReaderWpcomPostsAsUnseenMutation,
} from '../read-seen-posts';
import type { ReactNode } from 'react';

jest.mock( '../read-follows', () => ( {
	patchSubscriptionSeenCount: jest.fn(),
} ) );

const BASE = 'https://public-api.wordpress.com';
const SOURCE = 'reader-web';
const patchSubscriptionSeenCountSpy = patchSubscriptionSeenCount as jest.Mock;

const makeWrapper = ( client: QueryClient ) =>
	function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};

const newClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

beforeEach( () => patchSubscriptionSeenCountSpy.mockClear() );
afterEach( () => nock.cleanAll() );

describe( 'markReaderPostsAsSeenMutation', () => {
	it( 'posts to /seen-posts/seen/new and decrements the feed subscription unseen_count', async () => {
		const request = nock( BASE )
			.post( '/wpcom/v2/seen-posts/seen/new', {
				feed_id: 42,
				feed_item_ids: [ 100, 101, 102 ],
				source: SOURCE,
			} )
			.reply( 200, { status: true } );
		const client = newClient();

		const { result } = renderHook( () => useMutation( markReaderPostsAsSeenMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await result.current.mutateAsync( {
				feedId: 42,
				feedItemIds: [ 100, 101, 102 ],
				source: SOURCE,
			} );
		} );

		expect( request.isDone() ).toBe( true );
		expect( patchSubscriptionSeenCountSpy ).toHaveBeenCalledTimes( 1 );
		expect( patchSubscriptionSeenCountSpy ).toHaveBeenCalledWith(
			client,
			{ feedIds: [ 42 ] },
			expect.any( Function )
		);
		const update = patchSubscriptionSeenCountSpy.mock.calls[ 0 ][ 2 ];
		expect( update( 10 ) ).toBe( 7 );
	} );
} );

describe( 'markReaderPostsAsUnseenMutation', () => {
	it( 'posts to /seen-posts/seen/delete and increments the feed subscription unseen_count', async () => {
		const request = nock( BASE )
			.post( '/wpcom/v2/seen-posts/seen/delete', {
				feed_id: 42,
				feed_item_ids: [ 100, 101 ],
				source: SOURCE,
			} )
			.reply( 200, { status: true } );
		const client = newClient();

		const { result } = renderHook( () => useMutation( markReaderPostsAsUnseenMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await result.current.mutateAsync( {
				feedId: 42,
				feedItemIds: [ 100, 101 ],
				source: SOURCE,
			} );
		} );

		expect( request.isDone() ).toBe( true );
		expect( patchSubscriptionSeenCountSpy ).toHaveBeenCalledTimes( 1 );
		expect( patchSubscriptionSeenCountSpy ).toHaveBeenCalledWith(
			client,
			{ feedIds: [ 42 ] },
			expect.any( Function )
		);
		const update = patchSubscriptionSeenCountSpy.mock.calls[ 0 ][ 2 ];
		expect( update( 10 ) ).toBe( 12 );
	} );
} );

describe( 'markReaderWpcomPostsAsSeenMutation', () => {
	it( 'posts to /seen-posts/seen/blog/new and decrements the blog subscription unseen_count', async () => {
		const request = nock( BASE )
			.post( '/wpcom/v2/seen-posts/seen/blog/new', {
				blog_id: 555,
				post_ids: [ 7, 8 ],
				source: SOURCE,
			} )
			.reply( 200, { status: true } );
		const client = newClient();

		const { result } = renderHook(
			() => useMutation( markReaderWpcomPostsAsSeenMutation( client ) ),
			{ wrapper: makeWrapper( client ) }
		);

		await act( async () => {
			await result.current.mutateAsync( {
				blogId: 555,
				postIds: [ 7, 8 ],
				source: SOURCE,
			} );
		} );

		expect( request.isDone() ).toBe( true );
		expect( patchSubscriptionSeenCountSpy ).toHaveBeenCalledTimes( 1 );
		expect( patchSubscriptionSeenCountSpy ).toHaveBeenCalledWith(
			client,
			{ blogId: 555 },
			expect.any( Function )
		);
		const update = patchSubscriptionSeenCountSpy.mock.calls[ 0 ][ 2 ];
		expect( update( 10 ) ).toBe( 8 );
	} );
} );

describe( 'markReaderWpcomPostsAsUnseenMutation', () => {
	it( 'posts to /seen-posts/seen/blog/delete and increments the blog subscription unseen_count', async () => {
		const request = nock( BASE )
			.post( '/wpcom/v2/seen-posts/seen/blog/delete', {
				blog_id: 555,
				post_ids: [ 7 ],
				source: SOURCE,
			} )
			.reply( 200, { status: true } );
		const client = newClient();

		const { result } = renderHook(
			() => useMutation( markReaderWpcomPostsAsUnseenMutation( client ) ),
			{ wrapper: makeWrapper( client ) }
		);

		await act( async () => {
			await result.current.mutateAsync( {
				blogId: 555,
				postIds: [ 7 ],
				source: SOURCE,
			} );
		} );

		expect( request.isDone() ).toBe( true );
		expect( patchSubscriptionSeenCountSpy ).toHaveBeenCalledTimes( 1 );
		expect( patchSubscriptionSeenCountSpy ).toHaveBeenCalledWith(
			client,
			{ blogId: 555 },
			expect.any( Function )
		);
		const update = patchSubscriptionSeenCountSpy.mock.calls[ 0 ][ 2 ];
		expect( update( 10 ) ).toBe( 11 );
	} );
} );

describe( 'markAllReaderPostsAsSeenMutation', () => {
	it( 'posts to /seen-posts/seen/all/new and resets the unseen_count to zero for the given feeds', async () => {
		const request = nock( BASE )
			.post( '/wpcom/v2/seen-posts/seen/all/new', {
				feed_ids: [ 10, 30 ],
				source: SOURCE,
			} )
			.reply( 200, { status: true } );
		const client = newClient();

		const { result } = renderHook(
			() => useMutation( markAllReaderPostsAsSeenMutation( client ) ),
			{ wrapper: makeWrapper( client ) }
		);

		await act( async () => {
			await result.current.mutateAsync( {
				feedIds: [ 10, 30 ],
				source: SOURCE,
			} );
		} );

		expect( request.isDone() ).toBe( true );
		expect( patchSubscriptionSeenCountSpy ).toHaveBeenCalledTimes( 1 );
		expect( patchSubscriptionSeenCountSpy ).toHaveBeenCalledWith(
			client,
			{ feedIds: [ 10, 30 ] },
			expect.any( Function )
		);
		const update = patchSubscriptionSeenCountSpy.mock.calls[ 0 ][ 2 ];
		expect( update( 10 ) ).toBe( 0 );
	} );
} );
