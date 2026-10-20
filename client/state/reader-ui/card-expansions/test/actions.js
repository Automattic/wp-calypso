import { getSiteSubscriptionsQueryKey } from '@automattic/api-queries';
import { recordTrackForPost } from 'calypso/reader/stats';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import { expandCard } from '../actions';

jest.mock( 'calypso/reader/stats', () => ( { recordTrackForPost: jest.fn() } ) );
jest.mock( 'calypso/reader/mark-post-seen', () => ( { markPostSeen: jest.fn() } ) );
jest.mock( 'calypso/state/query-client', () => {
	const { QueryClient } = jest.requireActual( '@tanstack/react-query' );
	const mockQueryClient = new QueryClient();
	return { getCalypsoQueryClient: () => mockQueryClient };
} );

describe( 'expandCard', () => {
	const queryClient = getCalypsoQueryClient();
	const post = { ID: 1, site_ID: 100, feed_ID: 200, display_type: 0 };
	const open = () =>
		expandCard( { postKey: { blogId: 100, postId: 1 }, post, site: {} } )( jest.fn() );

	afterEach( () => {
		queryClient.clear();
		jest.clearAllMocks();
	} );

	test( 'records the article open with whether the user follows the blog', () => {
		queryClient.setQueryData( getSiteSubscriptionsQueryKey(), {
			pages: [
				{
					subscriptions: [ { blog_ID: 100, feed_ID: 200, is_following: true } ],
					totalCount: 1,
					page: 1,
					number: 200,
				},
			],
			pageParams: [ 1 ],
		} );

		open();

		expect( recordTrackForPost ).toHaveBeenCalledWith( 'calypso_reader_article_opened', post, {
			is_following: true,
		} );
	} );

	test( 'leaves is_following unset before the subscriptions load', () => {
		open();

		expect( recordTrackForPost ).toHaveBeenCalledWith( 'calypso_reader_article_opened', post, {
			is_following: undefined,
		} );
	} );
} );
