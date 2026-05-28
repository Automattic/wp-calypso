import { readFeedQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { getCachedFeed } from 'calypso/reader/data/feed';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import { fetch, onError, onSuccess } from '..';

jest.mock( 'calypso/state/query-client', () => ( {
	getCalypsoQueryClient: jest.fn(),
} ) );

describe( 'seen-posts mark-as-seen data layer', () => {
	it( 'optimistically decrements feed unseen count and rolls back on failure', () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( readFeedQuery( 200 ).queryKey, {
			feed_ID: 200,
			blog_ID: 100,
			feed_URL: 'https://example.com/feed',
			unseen_count: 3,
		} );
		getCalypsoQueryClient.mockReturnValue( queryClient );
		const action = {
			feedId: 200,
			feedUrl: 'https://example.com/feed',
			feedItemIds: [ 1, 2 ],
			globalIds: [ 'global-1', 'global-2' ],
			source: 'reader-web',
		};

		fetch( action );

		expect( getCachedFeed( queryClient, 200 )?.unseen_count ).toBe( 1 );

		expect( onError( action ) ).toEqual( [] );

		expect( getCachedFeed( queryClient, 200 )?.unseen_count ).toBe( 3 );
	} );

	it( 'rolls back the optimistic decrement when the API rejects with a false status', () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( readFeedQuery( 201 ).queryKey, {
			feed_ID: 201,
			blog_ID: 101,
			feed_URL: 'https://example.com/false-status-feed',
			unseen_count: 4,
		} );
		getCalypsoQueryClient.mockReturnValue( queryClient );
		const action = {
			feedId: 201,
			feedUrl: 'https://example.com/false-status-feed',
			feedItemIds: [ 1, 2 ],
			globalIds: [ 'global-1', 'global-2' ],
			source: 'reader-web',
		};

		fetch( action );

		expect( getCachedFeed( queryClient, 201 )?.unseen_count ).toBe( 2 );

		onSuccess( action, { status: false } )( jest.fn() );

		expect( getCachedFeed( queryClient, 201 )?.unseen_count ).toBe( 4 );
	} );

	it( 'keeps rollback snapshots separate for identical in-flight actions', () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( readFeedQuery( 202 ).queryKey, {
			feed_ID: 202,
			blog_ID: 102,
			feed_URL: 'https://example.com/duplicate-feed',
			unseen_count: 5,
		} );
		getCalypsoQueryClient.mockReturnValue( queryClient );
		const action = {
			feedId: 202,
			feedUrl: 'https://example.com/duplicate-feed',
			feedItemIds: [ 1, 2 ],
			globalIds: [ 'global-1', 'global-2' ],
			source: 'reader-web',
		};
		const duplicateAction = { ...action };

		fetch( action );
		fetch( duplicateAction );

		expect( getCachedFeed( queryClient, 202 )?.unseen_count ).toBe( 1 );

		onSuccess( action, { status: true } )( jest.fn() );
		expect( onError( duplicateAction ) ).toEqual( [] );

		expect( getCachedFeed( queryClient, 202 )?.unseen_count ).toBe( 3 );
	} );
} );
