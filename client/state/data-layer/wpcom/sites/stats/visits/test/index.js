import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestChartCounts, receiveChartCounts } from 'calypso/state/stats/chart-tabs/actions';
import reducer from 'calypso/state/stats/chart-tabs/reducer';
import { getFailedTabs, getLoadingTabs } from 'calypso/state/stats/chart-tabs/selectors';
import { fetch, onSuccess, onError } from '../';

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
				{ ...action, statFields: [ 'views', 'visitors' ] }
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
				{ ...action, statFields: [ 'likes', 'comments', 'post_titles' ] }
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
		const output = onSuccess(
			{ siteId: 1, date: '2018-09-20', period: 'year', quantity: 1 },
			data
		);
		expect( output ).toEqual( receiveChartCounts( 1, '2018-09-20', 'year', 1, data ) );
	} );
} );

describe( 'failed chart requests', () => {
	const query = {
		chartTab: 'views',
		date: '2100-01-01',
		period: 'day',
		quantity: 1,
		siteId: 1,
		statFields: [ 'views', 'visitors', 'likes', 'comments' ],
	};
	const selectArgs = [ query.siteId, query.date, query.period, query.quantity ];
	const asState = ( chartTabs ) => ( { stats: { chartTabs } } );

	it( 'stops loading only the failed request fields and preserves their errors when another request succeeds', () => {
		const action = requestChartCounts( query );
		const [ current, other ] = fetch( action );
		let state = reducer( undefined, action );
		state = reducer( state, onError( current.onFailure ) );
		expect( getFailedTabs( asState( state ), ...selectArgs ) ).toEqual( [ 'views', 'visitors' ] );
		expect( getLoadingTabs( asState( state ), ...selectArgs ) ).toEqual( [ 'likes', 'comments' ] );
		state = reducer(
			state,
			onSuccess( other.onSuccess, [ { period: query.date, likes: 2, comments: 1 } ] )
		);
		expect( getFailedTabs( asState( state ), ...selectArgs ) ).toEqual( [ 'views', 'visitors' ] );
		expect( getLoadingTabs( asState( state ), ...selectArgs ) ).toEqual( [] );
	} );

	it( 'clears failure state on retry and recovers when the request succeeds', () => {
		const action = requestChartCounts( query );
		const [ current ] = fetch( action );
		let state = reducer( reducer( undefined, action ), onError( current.onFailure ) );
		state = reducer( state, action );
		expect( getFailedTabs( asState( state ), ...selectArgs ) ).toEqual( [] );
		expect( getLoadingTabs( asState( state ), ...selectArgs ) ).toEqual( query.statFields );
		state = reducer(
			state,
			onSuccess( current.onSuccess, [ { period: query.date, views: 3, visitors: 2 } ] )
		);
		expect( getFailedTabs( asState( state ), ...selectArgs ) ).toEqual( [] );
		expect( getLoadingTabs( asState( state ), ...selectArgs ) ).toEqual( [ 'likes', 'comments' ] );
	} );

	it( 'handles hourly failures without marking another date as failed', () => {
		const action = requestChartCounts( { ...query, period: 'hour', statFields: [ 'views' ] } );
		const request = fetch( action );
		const state = asState( reducer( reducer( undefined, action ), onError( request.onFailure ) ) );
		expect( getFailedTabs( state, 1, query.date, 'hour', 1 ) ).toEqual( [ 'views' ] );
		expect( getLoadingTabs( state, 1, query.date, 'hour', 1 ) ).toEqual( [] );
		expect( getFailedTabs( state, 1, '2100-01-02', 'hour', 1 ) ).toEqual( [] );
	} );
} );
