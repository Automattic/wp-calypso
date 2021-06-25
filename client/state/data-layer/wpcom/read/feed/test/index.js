/**
 * External dependencies
 */
import freeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	requestReadFeedSearch,
	receiveReadFeedSearchSuccess,
	receiveReadFeedSearchError,
	fromApi,
	requestReadFeed,
	receiveReadFeedSuccess,
	receiveReadFeedError,
} from '../';
import { NOTICE_CREATE } from 'calypso/state/action-types';
import {
	READER_FEED_REQUEST_SUCCESS,
	READER_FEED_REQUEST_FAILURE,
} from 'calypso/state/reader/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestFeed } from 'calypso/state/reader/feeds/actions';
import { requestFeedSearch, receiveFeedSearch } from 'calypso/state/reader/feed-searches/actions';
import queryKey from 'calypso/state/reader/feed-searches/query-key';

const feeds = freeze( [ { blog_ID: 123, subscribe_URL: 'http://example.com' } ] );

const query = 'okapis and giraffes';

describe( 'wpcom-api', () => {
	describe( 'search feeds', () => {
		describe( '#requestReadFeedSearch', () => {
			test( 'should dispatch http request for feed search with followed feeds excluded by default', () => {
				const action = requestFeedSearch( { query } );

				expect( requestReadFeedSearch( action ) ).toMatchObject(
					http(
						{
							method: 'GET',
							path: '/read/feed',
							apiVersion: '1.1',
							query: { q: query, offset: 0, exclude_followed: true, sort: 'relevance' },
						},
						action
					)
				);
			} );

			test( 'should dispatch http request for feed search with followed feeds included if specified', () => {
				const action = requestFeedSearch( { query, excludeFollowed: false } );

				expect( requestReadFeedSearch( action ) ).toMatchObject(
					http(
						{
							method: 'GET',
							path: '/read/feed',
							apiVersion: '1.1',
							query: { q: query, offset: 0, exclude_followed: false, sort: 'relevance' },
						},
						action
					)
				);
			} );

			test( 'should dispatch http request for feed search with the offset specified', () => {
				const action = requestFeedSearch( { query, offset: 10 } );

				expect( requestReadFeedSearch( action ) ).toMatchObject(
					http(
						{
							method: 'GET',
							path: '/read/feed',
							apiVersion: '1.1',
							query: { q: query, offset: 10, exclude_followed: true, sort: 'relevance' },
						},
						action
					)
				);
			} );
		} );

		describe( '#receiveReadFeedSearchSuccess', () => {
			test( 'should dispatch an action with the feed results', () => {
				const action = requestFeedSearch( { query } );
				const apiResponse = fromApi( { feeds, total: 500 } );

				expect( receiveReadFeedSearchSuccess( action, apiResponse ) ).toMatchObject(
					receiveFeedSearch(
						queryKey( action.payload ),
						[
							{
								blog_ID: 123,
								feed_URL: 'http://example.com',
								subscribe_URL: 'http://example.com',
							},
						],
						200
					)
				);
			} );
		} );

		describe( '#receiveReadFeedSearchError', () => {
			test( 'should dispatch error notice', () => {
				const action = requestFeedSearch( { query } );

				expect( receiveReadFeedSearchError( action ) ).toMatchObject( {
					type: NOTICE_CREATE,
				} );
			} );
		} );
	} );

	describe( 'request a single feed', () => {
		const feedId = 123;

		describe( '#requestReadFeed', () => {
			test( 'should dispatch a http request', () => {
				const action = requestFeed( feedId );

				expect( requestReadFeed( action ) ).toMatchObject(
					http(
						{
							apiVersion: '1.1',
							method: 'GET',
							path: `/read/feed/${ feedId }`,
						},
						action
					)
				);
			} );
		} );

		describe( '#receiveReadFeedSuccess', () => {
			test( 'should dispatch an action with the feed results', () => {
				const action = requestFeed( feedId );
				const apiResponse = { feed_ID: 123 };

				expect( receiveReadFeedSuccess( action, apiResponse ) ).toMatchObject( {
					type: READER_FEED_REQUEST_SUCCESS,
					payload: { feed_ID: 123 },
				} );
			} );
		} );

		describe( '#receiveReadFeedError', () => {
			test( 'should dispatch an error action', () => {
				const action = requestFeed( feedId );
				const apiResponse = { error: '417' };

				expect( receiveReadFeedError( action, apiResponse ) ).toMatchObject( {
					type: READER_FEED_REQUEST_FAILURE,
					payload: { feed_ID: 123 },
					error: apiResponse,
				} );
			} );
		} );
	} );
} );
