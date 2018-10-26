/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { fetchStats, receiveStats, fromApi } from '..';
import { receiveGoogleMyBusinessStats } from 'state/google-my-business/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( '#fromApi', () => {
	const data = {
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
		],
	};

	test( 'should transform snake_case to camelCase', () => {
		expect( fromApi( data ) ).toEqual( {
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
			],
		} );
	} );
} );

describe( '#fetchStats', () => {
	test( 'should dispatch HTTP request to Google My Business stats endpoint', () => {
		const action = {
			siteId: 12345,
			statType: 'queries',
		};

		const result = fetchStats( action );

		expect( result ).toEqual(
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
		const action = {
			interval: 'month',
			aggregation: 'total',
			siteId: 12345,
			statType: 'views',
		};

		const result = receiveStats( action, {
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

		expect( result ).toEqual(
			receiveGoogleMyBusinessStats(
				action.siteId,
				action.statType,
				action.interval,
				action.aggregation,
				{
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
				}
			)
		);
	} );

	test( 'should transform data snake_case to camelCase', () => {
		const action = {
			interval: 'quarter',
			aggregation: 'daily',
			siteId: 12345,
			statType: 'actions',
		};

		const result = receiveStats( action, { hello_world: 'hello' } );

		expect( result ).toEqual(
			receiveGoogleMyBusinessStats(
				action.siteId,
				action.statType,
				action.interval,
				action.aggregation,
				{
					hello_world: 'hello',
				}
			)
		);
	} );
} );
