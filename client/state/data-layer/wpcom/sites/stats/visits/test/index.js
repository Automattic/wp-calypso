/**
 * Internal Dependencies
 */
import { fetch, onSuccess } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestChartCounts, receiveChartCounts } from 'calypso/state/stats/chart-tabs/actions';

describe( 'fetch', () => {
	it( 'should dispatch two http requests: one for the currently selected tab and another for the other tabs', () => {
		const action = requestChartCounts( {
			chartTab: 'views',
			date: '2100-01-01',
			period: 'day',
			quantity: 10,
			siteId: 1,
			statFields: [ 'views', 'visitors', 'likes', 'comments', 'post_titles' ],
		} );
		const output = fetch( action );
		expect( output ).toHaveLength( 2 );
		expect( output ).toEqual( [
			http(
				{
					method: 'GET',
					path: `/sites/1/stats/visits`,
					apiVersion: '1.1',
					query: {
						unit: 'day',
						date: '2100-01-01',
						quantity: 10,
						stat_fields: 'views,visitors',
					},
				},
				action
			),
			http(
				{
					method: 'GET',
					path: `/sites/1/stats/visits`,
					apiVersion: '1.1',
					query: {
						unit: 'day',
						date: '2100-01-01',
						quantity: 10,
						stat_fields: 'likes,comments,post_titles',
					},
				},
				action
			),
		] );
	} );
} );

describe( 'onSuccess', () => {
	test( 'should return a receiveChartCounts action with a transformed API response', () => {
		const data = {
			1: {
				year: [
					{
						period: '2018-09-20',
						views: 247,
						labelDay: 'Sep 20',
						classNames: [],
					},
				],
			},
		};
		const output = onSuccess( { siteId: 1, period: 'year' }, data );
		expect( output ).toEqual( receiveChartCounts( 1, 'year', data ) );
	} );
} );
