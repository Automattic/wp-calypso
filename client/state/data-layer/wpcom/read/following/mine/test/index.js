/*
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import { find } from 'lodash';
import freeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { READER_FOLLOWS_SYNC_START, READER_FOLLOWS_SYNC_PAGE } from 'state/action-types';
import {
	requestFollowAction,
	isSyncingFollows,
	requestPage,
	requestPageAction,
	receivePage,
	receiveError,
	feedsFromApi,
	subscriptionsFromApi,
	isValidApiResponse,
	syncReaderFollows,
} from '../';
import { receiveFollows as receiveFollowsAction } from 'state/reader/follows/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { NOTICE_CREATE } from 'state/action-types';

describe( 'get follow subscriptions', () => {
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
			expect( dispatch ).to.have.been.calledWith( http( {
				method: 'GET',
				path: '/read/following/mine',
				apiVersion: '1.2',
				query: { page: 1, number: 50, meta: 'feed' },
				onSuccess: action,
				onError: action,
			} ) );
		} );

		it( 'should pass the original action along the middleware chain', () => {
			const action = requestPageAction();
			const dispatch = sinon.spy();
			const next = sinon.spy();

			requestPage( { dispatch }, action, next );

			expect( next ).to.have.been.calledWith( action );
		} );
	} );

	describe( '#receivePageSuccess', () => {
		it( 'if non-empty subs then should dispatch subs-receive and request next page', () => {
			const action = requestPageAction( 1, 50, '' ); // no feeds
			const dispatch = sinon.spy();
			const next = sinon.spy();
			const successfulApiResponse = { subscriptions: [ { sub1: 'chicken' } ] };

			receivePage( { dispatch }, action, next, successfulApiResponse );

			expect( dispatch ).to.have.been.calledTwice;
			expect( dispatch ).to.have.been.calledWith(
				receiveFollowsAction( subscriptionsFromApi( successfulApiResponse ) )
			);
			expect( dispatch ).to.have.been.calledWith( requestPageAction( 2 ) );
		} );
	} );

	// describe( '#receiveError', () => {
	// 	it( 'should dispatch an error notice', () => {
	// 		const action = requestFollowAction( slug );
	// 		const dispatch = sinon.spy();
	// 		const next = sinon.spy();
	// 		const error = 'could not find tag';

	// 		receiveError( { dispatch }, action, next, error );

	// 		expect( dispatch ).to.have.been.calledOnce;
	// 		expect( dispatch ).to.have.been.calledWithMatch( {
	// 			type: NOTICE_CREATE,
	// 		} );
	// 	} );
	// } );
} );
