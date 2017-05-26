/*
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import freeze from 'deep-freeze';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_FOLLOWS_SYNC_START } from 'state/action-types';
import {
	isSyncingFollows,
	requestPage,
	requestPageAction,
	receivePage,
	receiveError,
	subscriptionsFromApi,
	isValidApiResponse,
	syncReaderFollows,
	resetSyncingFollows,
	updateSeenOnFollow,
} from '../';
import {
	receiveFollows as receiveFollowsAction,
	follow,
	syncComplete,
} from 'state/reader/follows/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { NOTICE_CREATE } from 'state/action-types';

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
		it( 'should request first page + set syncing to true', () => {
			const action = { type: READER_FOLLOWS_SYNC_START };
			const dispatch = sinon.spy();
			const next = sinon.spy();

			syncReaderFollows( { dispatch }, action, next );

			expect( isSyncingFollows() ).ok;
			expect( dispatch ).calledWith( requestPageAction() );
		} );
	} );

	describe( '#requestPage', () => {
		it( 'should dispatch HTTP request to following/mine endpoint', () => {
			const action = requestPageAction();
			const dispatch = sinon.spy();
			const next = sinon.spy();

			requestPage( { dispatch }, action, next );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				http( {
					method: 'GET',
					path: '/read/following/mine',
					apiVersion: '1.2',
					query: { page: 1, number: 200, meta: '' },
					onSuccess: action,
					onError: action,
				} )
			);
		} );
	} );

	describe( '#receivePageSuccess', () => {
		it( 'if non-empty subs then should dispatch subs-receive and request next page', () => {
			const startSyncAction = { type: READER_FOLLOWS_SYNC_START };
			const action = requestPageAction(); // no feeds
			const dispatch = sinon.spy();
			const next = sinon.spy();

			syncReaderFollows( { dispatch }, startSyncAction, next );
			receivePage( { dispatch }, action, next, successfulApiResponse );

			expect( dispatch ).to.have.been.calledThrice;
			expect( dispatch ).to.have.been.calledWith( requestPageAction( 1 ) );
			expect( dispatch ).to.have.been.calledWith( requestPageAction( 2 ) );
			expect( dispatch ).to.have.been.calledWith(
				receiveFollowsAction( {
					follows: subscriptionsFromApi( successfulApiResponse ),
					totalCount: successfulApiResponse.total_subscriptions,
				} )
			);
		} );

		it( 'should stop the sync process if it hits an empty page', () => {
			const startSyncAction = { type: READER_FOLLOWS_SYNC_START };
			const action = requestPageAction(); // no feeds
			const ignoredDispatch = noop;
			const dispatch = sinon.spy();
			const next = sinon.spy();

			const getState = () => ( {
				reader: {
					follows: {
						items: {
							'example.com': {
								ID: 5,
								is_following: true,
								feed_URL: 'http://example.com',
							},
						},
					},
				},
			} );

			syncReaderFollows( { dispatch: ignoredDispatch }, startSyncAction, next );
			receivePage( { dispatch: ignoredDispatch }, action, next, successfulApiResponse );
			receivePage( { dispatch, getState }, action, next, {
				number: 0,
				page: 2,
				total_subscriptions: 10,
				subscriptions: [],
			} );

			expect( dispatch ).to.have.been.calledTwice;
			expect( dispatch ).to.have.been.calledWith(
				receiveFollowsAction( {
					follows: [],
					totalCount: 10,
				} )
			);
			expect( dispatch ).to.have.been.calledWith(
				syncComplete( [ 'http://readerpostcards.wordpress.com', 'https://fivethirtyeight.com/' ] )
			);
		} );

		it( 'should catch a feed followed during the sync', () => {
			const startSyncAction = { type: READER_FOLLOWS_SYNC_START };
			const action = requestPageAction(); // no feeds
			const ignoredDispatch = noop;
			const dispatch = sinon.spy();
			const next = sinon.spy();

			const getState = () => ( {
				reader: {
					follows: {
						items: {
							'feed.example.com': {
								ID: 6,
								is_following: true,
								feed_URL: 'http://feed.example.com',
							},
						},
					},
				},
			} );

			syncReaderFollows( { dispatch: ignoredDispatch }, startSyncAction, next );
			receivePage( { dispatch: ignoredDispatch }, action, next, successfulApiResponse );

			updateSeenOnFollow(
				{ dispatch: ignoredDispatch },
				follow( 'http://feed.example.com' ),
				next
			);

			receivePage( { dispatch, getState }, action, next, {
				number: 0,
				page: 2,
				total_subscriptions: 10,
				subscriptions: [],
			} );

			expect( dispatch ).to.have.been.calledTwice;
			expect( dispatch ).to.have.been.calledWith(
				receiveFollowsAction( {
					follows: [],
					totalCount: 10,
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
		it( 'should dispatch an error notice', () => {
			const action = requestPageAction();
			const dispatch = sinon.spy();
			const next = sinon.spy();

			receiveError( { dispatch }, action, next );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWithMatch( {
				type: NOTICE_CREATE,
			} );
			expect( isSyncingFollows() ).not.ok;
		} );
	} );

	describe( '#isValidApiResponse', () => {
		it( 'should return false for invalid responses', () => {
			expect( isValidApiResponse( {} ) ).not.ok;
			expect( isValidApiResponse( { notExpected: 'true' } ) ).not.ok;
			expect( isValidApiResponse( { subscriptions: 'notAnArray' } ) ).not.ok;
		} );

		it( 'should return true for happy cases', () => {
			expect( isValidApiResponse( { subscriptions: [] } ) ).ok;
			expect( isValidApiResponse( successfulApiResponse ) ).ok;
		} );
	} );

	describe( '#subscriptionsFromApi', () => {
		it( 'should return subscriptions from the apiResponse', () => {
			const transformedSubs = [
				{
					ID: 12345,
					blog_ID: 122463145,
					URL: 'http://readerpostcards.wordpress.com',
					feed_URL: 'http://readerpostcards.wordpress.com',
					date_subscribed: Date.parse( '2017-01-12T03:55:45+00:00' ),
				},
				{
					ID: 123456,
					blog_ID: 64146350,
					URL: 'https://fivethirtyeight.com/',
					feed_URL: 'https://fivethirtyeight.com/',
					date_subscribed: Date.parse( '2016-01-12T03:55:45+00:00' ),
				},
			];
			expect( subscriptionsFromApi( successfulApiResponse ) ).eql( transformedSubs );
		} );

		it( 'should return an empty list from invalid apiResponse', () => {
			expect( subscriptionsFromApi( { notExpected: 'true' } ) ).eql( [] );
			expect( subscriptionsFromApi( { subscriptions: 'true' } ) ).eql( [] );
		} );
	} );
} );
