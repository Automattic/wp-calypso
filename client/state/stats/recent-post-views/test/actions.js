/**
 * Internal dependencies
 */
import { requestRecentPostViews, receiveRecentPostViews } from '../actions';
import {
	STATS_RECENT_POST_VIEWS_REQUEST,
	STATS_RECENT_POST_VIEWS_RECEIVE,
} from 'calypso/state/action-types';

describe( 'actions', () => {
	const siteId = 37463864;
	const date = '1969-07-20';

	describe( '#receiveRecentPostViews', () => {
		test( 'should create an action for requesting recent post views', () => {
			const postIds = '99,98,97';
			const num = 30;
			const action = requestRecentPostViews( siteId, postIds, num, date );

			expect( action ).toEqual( {
				type: STATS_RECENT_POST_VIEWS_REQUEST,
				siteId,
				postIds,
				num,
				date,
			} );
		} );
	} );

	describe( '#receiveRecentPostViews()', () => {
		test( 'should create an action for receiving recent post views', () => {
			const posts = [
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
			];
			const action = receiveRecentPostViews( siteId, { date, posts } );

			expect( action ).toEqual( {
				type: STATS_RECENT_POST_VIEWS_RECEIVE,
				siteId,
				date,
				posts,
			} );
		} );
	} );
} );
