/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { receiveSiteStats, requestSiteStats } from '../actions';
import {
	SITE_STATS_RECEIVE,
	SITE_STATS_REQUEST,
	SITE_STATS_REQUEST_FAILURE,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';

const SITE_ID = 2916284;
const STAT_TYPE = 'statsStreak';
const STAT_TYPE_VIDEO = 'statsVideo';
const STREAK_RESPONSE = {
	streak: {},
	data: {
		1461961382: 1,
		1464110402: 1,
		1464110448: 1,
	},
};
const STREAK_QUERY = { startDate: '2015-06-01', endDate: '2016-06-01' };
const VIDEO_RESPONSE = {
	data: [
		[ '2016-11-12', 1 ],
		[ '2016-11-13', 0 ],
	],
};

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.resetHistory();
	} );

	describe( 'receiveSiteStats()', () => {
		test( 'should return an action object', () => {
			const today = Date.now();
			const action = receiveSiteStats( SITE_ID, STAT_TYPE, STREAK_QUERY, STREAK_RESPONSE, today );

			expect( action ).to.eql( {
				type: SITE_STATS_RECEIVE,
				siteId: SITE_ID,
				statType: STAT_TYPE,
				data: STREAK_RESPONSE,
				query: STREAK_QUERY,
				date: today,
			} );
		} );
	} );

	describe( 'requestSiteStats()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/rest/v1.1/sites/${ SITE_ID }/stats/streak?startDate=2015-06-01&endDate=2016-06-01` )
				.reply( 200, STREAK_RESPONSE )
				.get( `/rest/v1.1/sites/${ SITE_ID }/stats/country-views` )
				.reply( 404, {
					error: 'not_found',
				} )
				.get( `/rest/v1.1/sites/${ SITE_ID }/stats/video/31533` )
				.reply( 200, VIDEO_RESPONSE );
		} );

		test( 'should dispatch a SITE_STATS_REQUEST', () => {
			requestSiteStats( SITE_ID, STAT_TYPE, STREAK_QUERY )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: SITE_STATS_REQUEST,
				siteId: SITE_ID,
				statType: STAT_TYPE,
				query: STREAK_QUERY,
			} );
		} );

		test( 'should dispatch a SITE_STATS_RECEIVE event on success', () => {
			return requestSiteStats(
				SITE_ID,
				STAT_TYPE,
				STREAK_QUERY
			)( spy ).then( () => {
				expect( spy ).to.have.been.calledWithMatch( {
					type: SITE_STATS_RECEIVE,
					siteId: SITE_ID,
					statType: STAT_TYPE,
					data: STREAK_RESPONSE,
					query: STREAK_QUERY,
				} );
			} );
		} );

		test( 'should dispatch SITE_STATS_RECEIVE action when video stats request succeeds', () => {
			return requestSiteStats( SITE_ID, STAT_TYPE_VIDEO, { postId: 31533 } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWithMatch( {
					type: SITE_STATS_RECEIVE,
					siteId: SITE_ID,
					statType: STAT_TYPE_VIDEO,
					data: VIDEO_RESPONSE,
					query: { postId: 31533 },
				} );
			} );
		} );

		test( 'should dispatch SITE_STATS_REQUEST_FAILURE action when request fails', () => {
			return requestSiteStats(
				SITE_ID,
				'statsCountryViews',
				{}
			)( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_STATS_REQUEST_FAILURE,
					siteId: SITE_ID,
					statType: 'statsCountryViews',
					query: {},
					error: sinon.match( { error: 'not_found' } ),
				} );
			} );
		} );
	} );
} );
