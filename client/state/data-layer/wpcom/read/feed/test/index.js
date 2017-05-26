/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import freeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { requestFeedSearch, receiveFeedSearch } from 'state/reader/feed-searches/actions';
import { initiateFeedSearch, receiveFeeds, receiveError } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { NOTICE_CREATE } from 'state/action-types';

const feeds = freeze( [ { blog_ID: 'IM A BLOG', subscribe_URL: 'feedUrl' } ] );

const query = 'okapis r us';

describe( 'wpcom-api', () => {
	describe( 'search feeds', () => {
		describe( '#initiateFeedSearch', () => {
			it( 'should dispatch http request for feed search', () => {
				const action = requestFeedSearch( query );
				const dispatch = sinon.spy();
				const next = sinon.spy();

				initiateFeedSearch( { dispatch }, action, next );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					http( {
						method: 'GET',
						path: '/read/feed',
						apiVersion: '1.1',
						query: { q: query, offset: 0 },
						onSuccess: action,
						onFailure: action,
					} )
				);
			} );
		} );

		describe( '#receiveFeeds', () => {
			it( 'should dispatch an action with the feed results', () => {
				const action = requestFeedSearch( query );
				const dispatch = sinon.spy();
				const next = sinon.spy();
				const apiResponse = { feeds, total: 500 };

				receiveFeeds( { dispatch }, action, next, apiResponse );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					receiveFeedSearch(
						query,
						[
							{
								blog_ID: 'IM A BLOG',
								feed_URL: 'feedUrl',
								subscribe_URL: 'feedUrl',
							},
						],
						200
					)
				);
			} );
		} );

		describe( '#receiveFeedsError', () => {
			it( 'should dispatch error notice', () => {
				const action = requestFeedSearch( query );
				const dispatch = sinon.spy();
				const next = sinon.spy();

				receiveError( { dispatch }, action, next );

				expect( dispatch ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
				} );
				expect( next ).callCount( 0 );
			} );
		} );
	} );
} );
