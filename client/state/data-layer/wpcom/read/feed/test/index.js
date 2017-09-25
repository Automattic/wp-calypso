/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import freeze from 'deep-freeze';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { initiateFeedSearch, receiveFeeds, receiveError } from '../';
import { NOTICE_CREATE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { requestFeedSearch, receiveFeedSearch } from 'state/reader/feed-searches/actions';
import queryKey from 'state/reader/feed-searches/query-key';

const feeds = freeze( [ { blog_ID: 'IM A BLOG', subscribe_URL: 'feedUrl' } ] );

const query = 'okapis r us';

describe( 'wpcom-api', () => {
	describe( 'search feeds', () => {
		describe( '#initiateFeedSearch', () => {
			it( 'should dispatch http request for feed search with followed feeds excluded by default', () => {
				const action = requestFeedSearch( { query } );
				const dispatch = sinon.spy();

				initiateFeedSearch( { dispatch }, action );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					http( {
						method: 'GET',
						path: '/read/feed',
						apiVersion: '1.1',
						query: { q: query, offset: 0, exclude_followed: true, sort: 'relevance' },
						onSuccess: action,
						onFailure: action,
					} )
				);
			} );

			it( 'should dispatch http request for feed search with followed feeds included if specified', () => {
				const action = requestFeedSearch( { query, excludeFollowed: false } );
				const dispatch = sinon.spy();

				initiateFeedSearch( { dispatch }, action );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					http( {
						method: 'GET',
						path: '/read/feed',
						apiVersion: '1.1',
						query: { q: query, offset: 0, exclude_followed: false, sort: 'relevance' },
						onSuccess: action,
						onFailure: action,
					} )
				);
			} );

			it( 'should dispatch http request for feed search with the offset specified', () => {
				const action = requestFeedSearch( { query, offset: 10 } );
				const dispatch = sinon.spy();

				initiateFeedSearch( { dispatch }, action );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					http( {
						method: 'GET',
						path: '/read/feed',
						apiVersion: '1.1',
						query: { q: query, offset: 10, exclude_followed: true, sort: 'relevance' },
						onSuccess: action,
						onFailure: action,
					} )
				);
			} );
		} );

		describe( '#receiveFeeds', () => {
			it( 'should dispatch an action with the feed results', () => {
				const action = requestFeedSearch( { query } );
				const dispatch = sinon.spy();
				const apiResponse = { feeds, total: 500 };

				receiveFeeds( { dispatch }, action, apiResponse );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					receiveFeedSearch(
						queryKey( action.payload ),
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
				const action = requestFeedSearch( { query } );
				const dispatch = sinon.spy();

				receiveError( { dispatch }, action );

				expect( dispatch ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
				} );
			} );
		} );
	} );
} );
