import { aggregateVideoPerformance, flattenVideoPlaysRows, VideoPlaysRow } from '../aggregate';

const row = ( overrides: Partial< VideoPlaysRow > = {} ): VideoPlaysRow => ( {
	post_id: 1,
	title: 'Video',
	views: 0,
	impressions: 0,
	watch_time: 0,
	retention_rate: 0,
	...overrides,
} );

describe( 'flattenVideoPlaysRows', () => {
	it( 'returns [] for missing or malformed payloads', () => {
		expect( flattenVideoPlaysRows( undefined ) ).toEqual( [] );
		expect( flattenVideoPlaysRows( null ) ).toEqual( [] );
		expect( flattenVideoPlaysRows( {} ) ).toEqual( [] );
		expect( flattenVideoPlaysRows( { days: { '2026-07-24': {} } } ) ).toEqual( [] );
	} );

	it( 'flattens rows across every day bucket', () => {
		const data = {
			days: {
				'2026-07-23': { data: [ row( { post_id: 1 } ) ] },
				'2026-07-24': { data: [ row( { post_id: 2 } ), row( { post_id: 3 } ) ] },
			},
		};
		expect( flattenVideoPlaysRows( data ).map( ( r ) => r.post_id ) ).toEqual( [ 1, 2, 3 ] );
	} );

	it( 'handles the summarized-range bucket', () => {
		const data = { days: { summary: { data: [ row( { post_id: 9 } ) ] } } };
		expect( flattenVideoPlaysRows( data ) ).toHaveLength( 1 );
	} );
} );

describe( 'aggregateVideoPerformance', () => {
	it( 'returns zeros and null retention for no rows', () => {
		expect( aggregateVideoPerformance( [] ) ).toEqual( {
			views: 0,
			impressions: 0,
			watch_time: 0,
			retention_rate: null,
		} );
	} );

	it( 'sums additive metrics', () => {
		const totals = aggregateVideoPerformance( [
			row( { views: 10, impressions: 100, watch_time: 1.5, retention_rate: 50 } ),
			row( { views: 30, impressions: 200, watch_time: 0.5, retention_rate: 90 } ),
		] );
		expect( totals.views ).toBe( 40 );
		expect( totals.impressions ).toBe( 300 );
		expect( totals.watch_time ).toBe( 2 );
	} );

	it( 'weights retention by views', () => {
		// views [10, 30], retention [50, 90] -> (500 + 2700) / 40 = 80
		const totals = aggregateVideoPerformance( [
			row( { views: 10, retention_rate: 50 } ),
			row( { views: 30, retention_rate: 90 } ),
		] );
		expect( totals.retention_rate ).toBe( 80 );
	} );

	it( 'ignores retention from rows with no views', () => {
		// only the 10-view row counts -> retention 50
		const totals = aggregateVideoPerformance( [
			row( { views: 10, retention_rate: 50 } ),
			row( { views: 0, retention_rate: 100 } ),
		] );
		expect( totals.retention_rate ).toBe( 50 );
	} );

	it( 'returns null retention when total views is zero', () => {
		const totals = aggregateVideoPerformance( [ row( { views: 0, retention_rate: 100 } ) ] );
		expect( totals.retention_rate ).toBeNull();
	} );
} );
