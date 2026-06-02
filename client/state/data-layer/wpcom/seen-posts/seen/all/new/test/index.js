import { getSiteSubscriptionsQueryKey, readFeedQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { getCachedFeed } from 'calypso/reader/data/feed';
import { upsertPostCache } from 'calypso/reader/data/post/cache';
import { getStreamInfiniteQueryKey } from 'calypso/reader/data/stream';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import { receiveMarkAllAsSeen } from 'calypso/state/reader/seen-posts/actions';
import { requestUnseenStatus } from 'calypso/state/reader-ui/seen-posts/actions';
import { fetch, onError, onSuccess } from '..';

jest.mock( 'calypso/state/query-client', () => ( {
	getCalypsoQueryClient: jest.fn(),
} ) );

describe( 'seen-posts mark-all-as-seen data layer', () => {
	it( 'optimistically resets feed unseen count and rolls back on failure', () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( readFeedQuery( 200 ).queryKey, {
			feed_ID: 200,
			blog_ID: 100,
			feed_URL: 'https://example.com/feed',
			unseen_count: 3,
		} );
		getCalypsoQueryClient.mockReturnValue( queryClient );
		const action = {
			identifier: 'following',
			feedIds: [ 200 ],
			feedUrls: [ 'https://example.com/feed' ],
			source: 'reader-web',
		};

		fetch( action );

		expect( getCachedFeed( queryClient, 200 )?.unseen_count ).toBe( 0 );

		expect( onError( action ) ).toEqual( [] );

		expect( getCachedFeed( queryClient, 200 )?.unseen_count ).toBe( 3 );
	} );

	it( 'rolls back the optimistic reset when the API rejects with a false status', () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( readFeedQuery( 201 ).queryKey, {
			feed_ID: 201,
			blog_ID: 101,
			feed_URL: 'https://example.com/false-status-feed',
			unseen_count: 4,
		} );
		getCalypsoQueryClient.mockReturnValue( queryClient );
		const action = {
			identifier: 'following',
			feedIds: [ 201 ],
			feedUrls: [ 'https://example.com/false-status-feed' ],
			source: 'reader-web',
		};

		fetch( action );

		expect( getCachedFeed( queryClient, 201 )?.unseen_count ).toBe( 0 );

		onSuccess( action, { status: false } )( jest.fn() );

		expect( getCachedFeed( queryClient, 201 )?.unseen_count ).toBe( 4 );
	} );

	it( 'derives global ids from the canonical Reader post cache on success', () => {
		const queryClient = new QueryClient();
		const posts = [
			{
				ID: 1,
				site_ID: 100,
				feed_ID: 200,
				feed_item_ID: 300,
				global_ID: 'global-1',
			},
			{
				ID: 2,
				site_ID: 100,
				feed_ID: 200,
				feed_item_ID: 301,
				global_ID: 'global-2',
			},
		];
		upsertPostCache( queryClient, posts );
		queryClient.setQueryData(
			getStreamInfiniteQueryKey( {
				streamKey: 'following',
				feedId: null,
				localeSlug: null,
				startDate: null,
			} ),
			{
				pages: [ { posts } ],
				pageParams: [ null ],
			}
		);
		getCalypsoQueryClient.mockReturnValue( queryClient );
		const invalidateQueries = jest.spyOn( queryClient, 'invalidateQueries' );

		const dispatch = jest.fn();

		onSuccess(
			{ identifier: 'following', feedIds: [ 200 ], feedUrls: [ 'https://example.com/feed' ] },
			{ status: true }
		)( dispatch );

		expect( dispatch ).toHaveBeenCalledWith( requestUnseenStatus() );
		expect( invalidateQueries ).toHaveBeenCalledWith( {
			queryKey: getSiteSubscriptionsQueryKey(),
		} );
		expect( dispatch ).toHaveBeenCalledWith(
			receiveMarkAllAsSeen( {
				feedIds: [ 200 ],
				feedUrls: [ 'https://example.com/feed' ],
				globalIds: [ 'global-1', 'global-2' ],
			} )
		);
	} );

	it( 'still dispatches mark-all-as-seen receive when Redux stream items are unavailable', () => {
		getCalypsoQueryClient.mockReturnValue( new QueryClient() );

		const dispatch = jest.fn();
		const getState = () => ( { reader: { streams: {} } } );

		onSuccess(
			{ identifier: 'following', feedIds: [ 200 ], feedUrls: [ 'https://example.com/feed' ] },
			{ status: true }
		)( dispatch, getState );

		expect( dispatch ).toHaveBeenCalledWith(
			receiveMarkAllAsSeen( {
				feedIds: [ 200 ],
				feedUrls: [ 'https://example.com/feed' ],
				globalIds: [],
			} )
		);
	} );
} );
