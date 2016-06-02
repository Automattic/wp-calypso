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

const siteId = 2916284;
const statType = 'statsStreak';
const streakResponse = {
	data: {
		1461961382: 1,
		1464110402: 1,
		1464110448: 1
	}
};
const streakQuery = { startDate: '2015-06-01', endDate: '2016-06-01' };

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
				siteId,
				statType,
				streakQuery,
				streakResponse
			);

			expect( action ).to.eql( {
				type: SITE_STATS_RECEIVE,
				siteId: siteId,
				statType: statType,
				data: streakResponse,
				query: streakQuery
			} );
		} );
	} );

	describe( 'requestSiteStats()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/rest/v1.1/sites/${ siteId }/stats/streak?startDate=2015-06-01&endDate=2016-06-01` )
				.reply( 200, streakResponse )
				.get( `/rest/v1.1/sites/${ siteId }/stats/country-views` )
				.reply( 404, {
					error: 'not_found'
				} );
		} );

		it( 'should dispatch a SITE_STATS_REQUEST', () => {
			requestSiteStats( siteId, statType, streakQuery )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: SITE_STATS_REQUEST,
				siteId: siteId,
				statType: statType,
				query: streakQuery
			} );
		} );

		it( 'should dispatch a SITE_STATS_RECEIVE event on success', () => {
			return requestSiteStats( siteId, statType, streakQuery )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_STATS_RECEIVE,
					siteId: siteId,
					statType: statType,
					data: streakResponse,
					query: streakQuery
				} );
			} );
		} );

		it( 'should dispatch SITE_STATS_REQUEST_SUCCESS action when request succeeds', () => {
			return requestSiteStats( siteId, statType, streakQuery )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_STATS_REQUEST_SUCCESS,
					siteId: siteId,
					statType: statType,
					query: streakQuery
				} );
			} );
		} );

		it( 'should dispatch SITE_STATS_REQUEST_FAILURE action when request fails', () => {
			return requestSiteStats( siteId, 'statsCountryViews', {} )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_STATS_REQUEST_FAILURE,
					siteId: siteId,
					statType: 'statsCountryViews',
					query: {},
					error: sinon.match( { error: 'not_found' } )
				} );
			} );
		} );
	} );
} );
