/**
 * Internal Dependencies
 */
import { fetch, onSuccess } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	requestRecentPostViews,
	receiveRecentPostViews,
} from 'calypso/state/stats/recent-post-views/actions';

describe( 'fetch', () => {
	it( 'should dispatch an http request', () => {
		const action = requestRecentPostViews( 1, [ 1, 2, 3 ], 30, '2018-01-01' );
		expect( fetch( action ) ).toEqual(
			http(
				{
					method: 'GET',
					path: `/sites/1/stats/views/posts`,
					apiVersion: '1.1',
					query: {
						post_ids: '1,2,3',
						num: 30,
						date: '2018-01-01',
					},
				},
				action
			)
		);
	} );
} );

describe( 'onSuccess', () => {
	test( 'should return a receiveRecentPostViews action with the data', () => {
		const data = {
			date: '2018-01-01',
			posts: [],
		};
		const output = onSuccess( { siteId: 1 }, data );
		expect( output ).toEqual( receiveRecentPostViews( 1, data ) );
	} );
} );
