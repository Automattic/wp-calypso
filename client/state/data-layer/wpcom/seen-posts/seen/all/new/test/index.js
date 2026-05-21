import { QueryClient } from '@tanstack/react-query';
import { upsertPostCache } from 'calypso/reader/data/post-cache';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import { requestFollows } from 'calypso/state/reader/follows/actions';
import { receiveMarkAllAsSeen } from 'calypso/state/reader/seen-posts/actions';
import { requestUnseenStatus } from 'calypso/state/reader-ui/seen-posts/actions';
import { onSuccess } from '..';

jest.mock( 'calypso/state/query-client', () => ( {
	getCalypsoQueryClient: jest.fn(),
} ) );

describe( 'seen-posts mark-all-as-seen data layer', () => {
	it( 'derives global ids from the canonical Reader post cache on success', () => {
		const queryClient = new QueryClient();
		upsertPostCache( queryClient, [
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
		] );
		getCalypsoQueryClient.mockReturnValue( queryClient );

		const dispatch = jest.fn();
		const getState = () => ( {
			reader: {
				streams: {
					following: {
						items: [
							{ feedId: 200, postId: 300 },
							{ feedId: 200, postId: 301 },
						],
					},
				},
			},
		} );

		onSuccess(
			{ identifier: 'following', feedIds: [ 200 ], feedUrls: [ 'https://example.com/feed' ] },
			{ status: true }
		)( dispatch, getState );

		expect( dispatch ).toHaveBeenCalledWith( requestUnseenStatus() );
		expect( dispatch ).toHaveBeenCalledWith( requestFollows() );
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
