/**
 * External dependencies
 */
import freeze from 'deep-freeze';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import {
	isSyncingFollows,
	requestPage,
	receivePage,
	receiveError,
	syncReaderFollows,
	syncReaderFollowsPage,
	resetSyncingFollows,
	updateSeenOnFollow,
} from '../';
import { subscriptionsFromApi } from '../utils';
import { NOTICE_CREATE } from 'calypso/state/action-types';
import { READER_FOLLOWS_SYNC_START } from 'calypso/state/reader/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { receiveFollows, follow, syncComplete } from 'calypso/state/reader/follows/actions';

const successfulApiResponse = freeze( {
	number: 2,
	page: 1,
	total_subscriptions: 2,
	subscriptions: [
		{
			ID: '12345',
			blog_ID: '122463145',
			URL: 'http://readerpostcards.wordpress.com',
			date_subscribed: '2017-01-12T03:55:45+00:00',
		},
		{
			ID: '123456',
			blog_ID: '64146350',
			URL: 'https://fivethirtyeight.com/',
			date_subscribed: '2016-01-12T03:55:45+00:00',
		},
	],
} );

describe( 'get follow subscriptions', () => {
	beforeEach( () => {
		resetSyncingFollows();
	} );

	describe( '#syncReaderFollows', () => {
		test( 'should request first page + set syncing to true', () => {
			const action = { type: READER_FOLLOWS_SYNC_START };
			const dispatch = jest.fn();

			syncReaderFollows( { dispatch }, action );

			expect( isSyncingFollows() ).toBe( true );
			expect( dispatch ).toHaveBeenCalledWith( syncReaderFollowsPage() );
		} );
	} );

	describe( '#requestPage', () => {
		test( 'should dispatch HTTP request to following/mine endpoint', () => {
			const action = syncReaderFollowsPage();

			expect( requestPage( action ) ).toEqual(
				http(
					{
						method: 'GET',
						path: '/read/following/mine',
						apiVersion: '1.2',
						query: { page: 1, number: 200, meta: '' },
					},
					action
				)
			);
		} );
	} );

	describe( '#receivePageSuccess', () => {
		test( 'if non-empty subs then should dispatch subs-receive and request next page', () => {
			const startSyncAction = { type: READER_FOLLOWS_SYNC_START };
			const action = syncReaderFollowsPage(); // no feeds
			const dispatch = jest.fn();

			syncReaderFollows( { dispatch }, startSyncAction );
			receivePage( action, successfulApiResponse )( dispatch );

			expect( dispatch ).toHaveBeenCalledTimes( 3 );
			expect( dispatch ).toHaveBeenCalledWith( syncReaderFollowsPage( 1 ) );
			expect( dispatch ).toHaveBeenCalledWith( syncReaderFollowsPage( 2 ) );
			expect( dispatch ).toHaveBeenCalledWith(
				receiveFollows( {
					follows: subscriptionsFromApi( successfulApiResponse ),
					totalCount: successfulApiResponse.total_subscriptions,
				} )
			);
		} );

		test( 'should stop the sync process if it hits an empty page', () => {
			const startSyncAction = { type: READER_FOLLOWS_SYNC_START };
			const action = syncReaderFollowsPage(); // no feeds
			const ignoredDispatch = noop;
			const dispatch = jest.fn();

			syncReaderFollows( { dispatch: ignoredDispatch }, startSyncAction );
			receivePage( action, successfulApiResponse )( ignoredDispatch );
			receivePage( action, {
				number: 0,
				page: 2,
				total_subscriptions: 10,
				subscriptions: [],
			} )( dispatch );

			expect( dispatch ).toHaveBeenCalledTimes( 2 );
			expect( dispatch ).toHaveBeenCalledWith(
				receiveFollows( {
					follows: [],
					totalCount: null,
				} )
			);
			expect( dispatch ).toHaveBeenCalledWith(
				syncComplete( [ 'http://readerpostcards.wordpress.com', 'https://fivethirtyeight.com/' ] )
			);
		} );

		test( 'should catch a feed followed during the sync', () => {
			const startSyncAction = { type: READER_FOLLOWS_SYNC_START };
			const action = syncReaderFollowsPage(); // no feeds
			const ignoredDispatch = noop;
			const dispatch = jest.fn();

			syncReaderFollows( { dispatch: ignoredDispatch }, startSyncAction );
			receivePage( action, successfulApiResponse )( ignoredDispatch );

			updateSeenOnFollow( { dispatch: ignoredDispatch }, follow( 'http://feed.example.com' ) );

			receivePage( action, {
				number: 0,
				page: 2,
				total_subscriptions: 10,
				subscriptions: [],
			} )( dispatch );

			expect( dispatch ).toHaveBeenCalledTimes( 2 );
			expect( dispatch ).toHaveBeenCalledWith(
				receiveFollows( {
					follows: [],
					totalCount: null,
				} )
			);

			expect( dispatch ).toHaveBeenCalledWith(
				syncComplete( [
					'http://readerpostcards.wordpress.com',
					'https://fivethirtyeight.com/',
					'http://feed.example.com',
				] )
			);
		} );
	} );

	describe( '#receiveError', () => {
		test( 'should dispatch an error notice', () => {
			const action = syncReaderFollowsPage();
			const result = receiveError( action );

			expect( result.type ).toBe( NOTICE_CREATE );
			expect( result.notice.status ).toBe( 'is-error' );
			expect( isSyncingFollows() ).toBe( false );
		} );
	} );
} );
