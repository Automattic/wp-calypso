/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { fetchStats, receiveStats } from '..';
import { receiveGoogleMyBusinessStats } from 'state/google-my-business/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( '#fetchStats', () => {
	test( 'should dispatch HTTP request to Google My Business stats endpoint', () => {
		const dispatch = sinon.spy();
		const action = {
			siteId: 12345,
			statType: 'queries',
		};

		fetchStats( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					path: '/sites/12345/stats/google-my-business/queries',
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
	test( 'should dispatch receive stats action', () => {
		const dispatch = sinon.spy();
		const action = {
			interval: 'month',
			aggregation: 'total',
			siteId: 12345,
			statType: 'views',
		};

		receiveStats( { dispatch }, action, {
			time_zone: 'Europe/London',
			metric_values: [
				{
					metric: 'QUERIES_DIRECT',
					total_value: {
						time_dimension: {
							timeRange: {
								endTime: '2018-04-19T23:59:59.900Z',
								startTime: '2018-04-13T00:00:00Z',
							},
						},
						metric_option: 'AGGREGATED_TOTAL',
						value: 0,
					},
				},
				{
					metric: 'QUERIES_INDIRECT',
					total_value: {
						time_dimension: {
							timeRange: {
								endTime: '2018-04-19T23:59:59.900Z',
								startTime: '2018-04-13T00:00:00Z',
							},
						},
						metric_option: 'AGGREGATED_TOTAL',
						value: 1,
					},
				},
			],
		} );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			receiveGoogleMyBusinessStats(
				action.siteId,
				action.statType,
				action.interval,
				action.aggregation,
				{
					timeZone: 'Europe/London',
					metricValues: [
						{
							metric: 'QUERIES_DIRECT',
							totalValue: {
								timeDimension: {
									timeRange: {
										endTime: '2018-04-19T23:59:59.900Z',
										startTime: '2018-04-13T00:00:00Z',
									},
								},
								metricOption: 'AGGREGATED_TOTAL',
								value: 0,
							},
						},
						{
							metric: 'QUERIES_INDIRECT',
							totalValue: {
								timeDimension: {
									timeRange: {
										endTime: '2018-04-19T23:59:59.900Z',
										startTime: '2018-04-13T00:00:00Z',
									},
								},
								metricOption: 'AGGREGATED_TOTAL',
								value: 1,
							},
						},
					],
				}
			)
		);
	} );

	test( 'should transform data snake_case to camelCase', () => {
		const dispatch = sinon.spy();
		const action = {
			interval: 'quarter',
			aggregation: 'daily',
			siteId: 12345,
			statType: 'actions',
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
