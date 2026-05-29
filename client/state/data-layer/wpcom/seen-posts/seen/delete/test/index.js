import { readFeedQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { getCachedFeed } from 'calypso/reader/data/feed';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import { fetch, onError, onSuccess } from '..';

jest.mock( 'calypso/state/query-client', () => ( {
	getCalypsoQueryClient: jest.fn(),
} ) );

describe( 'seen-posts mark-as-unseen data layer', () => {
	it( 'optimistically increments feed unseen count and rolls back on failure', () => {
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

		expect( getCachedFeed( queryClient, 200 )?.unseen_count ).toBe( 5 );

		expect( onError( action ) ).toEqual( [] );

		expect( getCachedFeed( queryClient, 200 )?.unseen_count ).toBe( 3 );
	} );

	it( 'rolls back the optimistic increment when the API rejects with a false status', () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( readFeedQuery( 201 ).queryKey, {
			feed_ID: 201,
			blog_ID: 101,
			feed_URL: 'https://example.com/false-status-feed',
			unseen_count: 3,
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

		expect( getCachedFeed( queryClient, 201 )?.unseen_count ).toBe( 5 );

		onSuccess( action, { status: false } )( jest.fn() );

		expect( getCachedFeed( queryClient, 201 )?.unseen_count ).toBe( 3 );
	} );
} );
