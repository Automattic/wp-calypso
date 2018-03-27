/** @format */
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
} from '../';
import { NOTICE_CREATE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { requestFeedSearch, receiveFeedSearch } from 'state/reader/feed-searches/actions';
import queryKey from 'state/reader/feed-searches/query-key';

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
} );
