/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import freeze from 'deep-freeze';
import { noop } from 'lodash';
import sinon from 'sinon';

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
import { READER_FOLLOWS_SYNC_START, NOTICE_CREATE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveFollows, follow, syncComplete } from 'state/reader/follows/actions';

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
			const dispatch = sinon.spy();

			syncReaderFollows( { dispatch }, action );

			expect( isSyncingFollows() ).ok;
			expect( dispatch ).calledWith( syncReaderFollowsPage() );
		} );
	} );

	describe( '#requestPage', () => {
		test( 'should dispatch HTTP request to following/mine endpoint', () => {
			const action = syncReaderFollowsPage();
			const result = requestPage( action );

			expect( result ).to.eql(
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
			const dispatch = sinon.spy();

			syncReaderFollows( { dispatch }, startSyncAction );
			receivePage( action, successfulApiResponse )( dispatch );

			expect( dispatch ).to.have.been.calledThrice;
			expect( dispatch ).to.have.been.calledWith( syncReaderFollowsPage( 1 ) );
			expect( dispatch ).to.have.been.calledWith( syncReaderFollowsPage( 2 ) );
			expect( dispatch ).to.have.been.calledWith(
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
			const dispatch = sinon.spy();

			syncReaderFollows( { dispatch: ignoredDispatch }, startSyncAction );
			receivePage( action, successfulApiResponse )( ignoredDispatch );
			receivePage( action, {
				number: 0,
				page: 2,
				total_subscriptions: 10,
				subscriptions: [],
			} )( dispatch );

			expect( dispatch ).to.have.been.calledTwice;
			expect( dispatch ).to.have.been.calledWith(
				receiveFollows( {
					follows: [],
					totalCount: null,
				} )
			);
			expect( dispatch ).to.have.been.calledWith(
				syncComplete( [ 'http://readerpostcards.wordpress.com', 'https://fivethirtyeight.com/' ] )
			);
		} );

		test( 'should catch a feed followed during the sync', () => {
			const startSyncAction = { type: READER_FOLLOWS_SYNC_START };
			const action = syncReaderFollowsPage(); // no feeds
			const ignoredDispatch = noop;
			const dispatch = sinon.spy();

			syncReaderFollows( { dispatch: ignoredDispatch }, startSyncAction );
			receivePage( action, successfulApiResponse )( ignoredDispatch );

			updateSeenOnFollow( { dispatch: ignoredDispatch }, follow( 'http://feed.example.com' ) );

			receivePage( action, {
				number: 0,
				page: 2,
				total_subscriptions: 10,
				subscriptions: [],
			} )( dispatch );

			expect( dispatch ).to.have.been.calledTwice;
			expect( dispatch ).to.have.been.calledWith(
				receiveFollows( {
					follows: [],
					totalCount: null,
				} )
			);

			expect( dispatch ).to.have.been.calledWith(
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

			expect( result.type ).to.eql( NOTICE_CREATE );
			expect( result.notice.status ).to.eql( 'is-error' );
			expect( isSyncingFollows() ).not.ok;
		} );
	} );
} );
