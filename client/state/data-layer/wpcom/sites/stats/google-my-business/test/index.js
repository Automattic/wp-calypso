/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { GOOGLE_MY_BUSINESS_STATS_SEARCH_REQUEST } from 'state/action-types';
import { fetchGoogleMyBusinessStats, receiveStats } from '../';
import { receiveGoogleMyBusinessStats } from 'state/google-my-business/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( '#fetchGoogleMyBusinessStatsSearch', () => {
	test( 'should dispatch HTTP request to Google My Business stats endpoint', () => {
		const action = {
			type: GOOGLE_MY_BUSINESS_STATS_SEARCH_REQUEST,
			interval: 'week',
			aggregation: 'total',
			siteId: 12345,
			statType: 'searches',
		};
		const dispatch = sinon.spy();

		fetchGoogleMyBusinessStats( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					path: '/sites/12345/stats/google-my-business/searches',
					method: 'GET',
					query: {
						interval: 'week',
						aggregation: 'total',
					},
				},
				action
			)
		);
	} );
} );

describe( '#receiveStats', () => {
	test( 'should dispatch recieve stats action', () => {
		const dispatch = sinon.spy();
		const action = {
			type: GOOGLE_MY_BUSINESS_STATS_SEARCH_REQUEST,
			interval: 'week',
			aggregation: 'total',
			siteId: 12345,
			statType: 'searches',
		};
		receiveStats( { dispatch }, action, { hello: 'world' } );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			receiveGoogleMyBusinessStats(
				action.siteId,
				action.statType,
				action.interval,
				action.aggregation,
				{
					hello: 'world',
				}
			)
		);
	} );

	test( 'should transform data snake_case to camelCase', () => {
		const dispatch = sinon.spy();
		const action = {
			type: GOOGLE_MY_BUSINESS_STATS_SEARCH_REQUEST,
			interval: 'week',
			aggregation: 'total',
			siteId: 12345,
			statType: 'searches',
		};
		receiveStats( { dispatch }, action, { hello_world: 'hello' } );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			receiveGoogleMyBusinessStats(
				action.siteId,
				action.statType,
				action.interval,
				action.aggregation,
				{
					helloWorld: 'hello',
				}
			)
		);
	} );
} );
