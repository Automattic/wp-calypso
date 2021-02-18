/**
 * Internal dependencies
 */
import { items } from '../reducer';
import { STATS_RECENT_POST_VIEWS_RECEIVE } from 'calypso/state/action-types';

describe( 'reducer', () => {
	const siteId = 15749347;
	const viewsPostsResponse = {
		date: '1969-07-20',
		posts: [
			{
				ID: 99,
				views: 1,
			},
			{
				ID: 2,
				views: 10000001,
			},
			{
				ID: 924756329847,
				views: 22,
			},
		],
	};

	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should index recent post views by ID for each site', () => {
			const state = items( null, {
				type: STATS_RECENT_POST_VIEWS_RECEIVE,
				siteId,
				posts: viewsPostsResponse.posts,
			} );

			expect( state ).toEqual( {
				[ siteId ]: {
					99: { views: 1 },
					2: { views: 10000001 },
					924756329847: { views: 22 },
				},
			} );
		} );

		test( 'should accumulate recent post views', () => {
			const originalState = Object.freeze( {
				[ siteId ]: { 73705554: { views: 9384 } },
			} );
			const updatedState = items( originalState, {
				type: STATS_RECENT_POST_VIEWS_RECEIVE,
				siteId,
				posts: viewsPostsResponse.posts,
			} );

			expect( updatedState ).toEqual( {
				[ siteId ]: {
					...originalState[ siteId ],
					99: { views: 1 },
					2: { views: 10000001 },
					924756329847: { views: 22 },
				},
			} );
		} );

		test( 'should override previous recent post views', () => {
			const originalState = Object.freeze( {
				[ siteId ]: { 99: { views: 253 } },
			} );
			const updatedState = items( originalState, {
				type: STATS_RECENT_POST_VIEWS_RECEIVE,
				siteId,
				posts: viewsPostsResponse.posts,
			} );

			expect( updatedState ).toEqual( {
				[ siteId ]: {
					99: { views: 1 },
					2: { views: 10000001 },
					924756329847: { views: 22 },
				},
			} );
		} );
	} );
} );
