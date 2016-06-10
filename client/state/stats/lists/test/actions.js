/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';
import nock from 'nock';

/**
 * Internal dependencies
 */
import {
	SITE_STATS_RECEIVE,
	SITE_STATS_REQUEST,
	SITE_STATS_REQUEST_FAILURE,
	SITE_STATS_REQUEST_SUCCESS
} from 'state/action-types';
import {
	receiveSiteStats,
	requestSiteStats
} from '../actions';

const SITE_ID = 2916284;
const STAT_TYPE = 'statsStreak';
const STREAK_RESPONSE = {
	streak: {},
	data: {
		1461961382: 1,
		1464110402: 1,
		1464110448: 1
	}
};
const STREAK_QUERY = { startDate: '2015-06-01', endDate: '2016-06-01' };

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	after( () => {
		nock.cleanAll();
	} );

	describe( 'receiveSiteStats()', () => {
		it( 'should return an action object', () => {
			const action = receiveSiteStats(
				SITE_ID,
				STAT_TYPE,
				STREAK_QUERY,
				STREAK_RESPONSE
			);

			expect( action ).to.eql( {
				type: SITE_STATS_RECEIVE,
				siteId: SITE_ID,
				statType: STAT_TYPE,
				data: STREAK_RESPONSE,
				query: STREAK_QUERY
			} );
		} );
	} );

	describe( 'requestSiteStats()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/rest/v1.1/sites/${ SITE_ID }/stats/streak?startDate=2015-06-01&endDate=2016-06-01` )
				.reply( 200, STREAK_RESPONSE )
				.get( `/rest/v1.1/sites/${ SITE_ID }/stats/country-views` )
				.reply( 404, {
					error: 'not_found'
				} );
		} );

		it( 'should dispatch a SITE_STATS_REQUEST', () => {
			requestSiteStats( SITE_ID, STAT_TYPE, STREAK_QUERY )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: SITE_STATS_REQUEST,
				siteId: SITE_ID,
				statType: STAT_TYPE,
				query: STREAK_QUERY
			} );
		} );

		it( 'should dispatch a SITE_STATS_RECEIVE event on success', () => {
			return requestSiteStats( SITE_ID, STAT_TYPE, STREAK_QUERY )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_STATS_RECEIVE,
					siteId: SITE_ID,
					statType: STAT_TYPE,
					data: STREAK_RESPONSE,
					query: STREAK_QUERY
				} );
			} );
		} );

		it( 'should dispatch SITE_STATS_REQUEST_SUCCESS action when request succeeds', () => {
			return requestSiteStats( SITE_ID, STAT_TYPE, STREAK_QUERY )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_STATS_REQUEST_SUCCESS,
					siteId: SITE_ID,
					statType: STAT_TYPE,
					query: STREAK_QUERY
				} );
			} );
		} );

		it( 'should dispatch SITE_STATS_REQUEST_FAILURE action when request fails', () => {
			return requestSiteStats( SITE_ID, 'statsCountryViews', {} )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_STATS_REQUEST_FAILURE,
					siteId: SITE_ID,
					statType: 'statsCountryViews',
					query: {},
					error: sinon.match( { error: 'not_found' } )
				} );
			} );
		} );
	} );
} );
