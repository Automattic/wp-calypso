import {
	EMPTY_PEER_FILTERS,
	filterPeers,
	isAnyFilterActive,
	summarizeMetric,
	summarizePeers,
} from '../filter-peers';
import type { PeerBenchmarkRow } from '../../constants';

function makePeer( overrides: Partial< PeerBenchmarkRow > = {} ): PeerBenchmarkRow {
	return {
		label: 'A',
		metrics: {
			gross_margin: 40,
			billable_utilization: 60,
			avg_project_size_usd: 10000,
			win_rate: 30,
			retainer_mrr_usd: 5000,
			avg_time_to_close_days: 20,
			client_retention: 85,
			ai_maturity_score: 50,
		},
		agency_size: '11-25',
		agency_region: 'NA',
		agency_specializations: [ 'website_design_development' ],
		...overrides,
	};
}

describe( 'isAnyFilterActive', () => {
	it( 'is false for the empty filters', () => {
		expect( isAnyFilterActive( EMPTY_PEER_FILTERS ) ).toBe( false );
	} );

	it( 'is true when any dimension is set', () => {
		expect( isAnyFilterActive( { ...EMPTY_PEER_FILTERS, size: '6-10' } ) ).toBe( true );
		expect( isAnyFilterActive( { ...EMPTY_PEER_FILTERS, region: 'unknown' } ) ).toBe( true );
		expect( isAnyFilterActive( { ...EMPTY_PEER_FILTERS, specialization: 'other' } ) ).toBe( true );
	} );
} );

describe( 'filterPeers', () => {
	const peers = [
		makePeer( { label: 'A', agency_size: '11-25', agency_region: 'NA' } ),
		makePeer( { label: 'B', agency_size: '6-10', agency_region: 'EMEA' } ),
		makePeer( { label: 'C', agency_size: null, agency_region: null } ),
		makePeer( {
			label: 'D',
			agency_size: '11-25',
			agency_region: 'NA',
			agency_specializations: [],
		} ),
		makePeer( {
			label: 'E',
			agency_size: '11-25',
			agency_region: 'NA',
			agency_specializations: [ 'ecommerce_development', 'strategy_consulting' ],
		} ),
	];

	it( 'returns everything for the empty filters', () => {
		expect( filterPeers( peers, EMPTY_PEER_FILTERS ) ).toHaveLength( peers.length );
	} );

	it( 'matches a scalar bucket exactly', () => {
		const result = filterPeers( peers, { ...EMPTY_PEER_FILTERS, size: '11-25' } );
		expect( result.map( ( p ) => p.label ) ).toEqual( [ 'A', 'D', 'E' ] );
	} );

	it( 'treats "unknown" as the null bucket for size and region', () => {
		expect(
			filterPeers( peers, { ...EMPTY_PEER_FILTERS, size: 'unknown' } ).map( ( p ) => p.label )
		).toEqual( [ 'C' ] );
		expect(
			filterPeers( peers, { ...EMPTY_PEER_FILTERS, region: 'unknown' } ).map( ( p ) => p.label )
		).toEqual( [ 'C' ] );
	} );

	it( 'matches a specialization when the peer includes it', () => {
		expect(
			filterPeers( peers, { ...EMPTY_PEER_FILTERS, specialization: 'ecommerce_development' } ).map(
				( p ) => p.label
			)
		).toEqual( [ 'E' ] );
	} );

	it( 'treats "unknown" specialization as the empty-array bucket', () => {
		expect(
			filterPeers( peers, { ...EMPTY_PEER_FILTERS, specialization: 'unknown' } ).map(
				( p ) => p.label
			)
		).toEqual( [ 'D' ] );
	} );

	it( 'combines dimensions with AND', () => {
		expect(
			filterPeers( peers, {
				size: '11-25',
				region: 'NA',
				specialization: 'strategy_consulting',
			} ).map( ( p ) => p.label )
		).toEqual( [ 'E' ] );
	} );

	it( 'can return an empty list', () => {
		expect( filterPeers( peers, { ...EMPTY_PEER_FILTERS, size: '251+' } ) ).toEqual( [] );
	} );
} );

describe( 'summarizeMetric', () => {
	it( 'returns null for empty input', () => {
		expect( summarizeMetric( [] ) ).toBeNull();
	} );

	it( 'collapses to one value for a single sample', () => {
		expect( summarizeMetric( [ 42 ] ) ).toEqual( {
			mean: 42,
			min: 42,
			p25: 42,
			median: 42,
			p75: 42,
			max: 42,
		} );
	} );

	it( 'computes a linear-interpolation 5-number summary rounded to 2dp', () => {
		expect( summarizeMetric( [ 1, 2, 3, 4, 5 ] ) ).toEqual( {
			mean: 3,
			min: 1,
			p25: 2,
			median: 3,
			p75: 4,
			max: 5,
		} );
		expect( summarizeMetric( [ 10, 20, 30, 40 ] ) ).toEqual( {
			mean: 25,
			min: 10,
			p25: 17.5,
			median: 25,
			p75: 32.5,
			max: 40,
		} );
	} );
} );

describe( 'summarizePeers', () => {
	it( 'returns null when there are no peers', () => {
		expect( summarizePeers( [] ) ).toBeNull();
	} );

	it( 'summarizes every metric key across the peers', () => {
		const result = summarizePeers( [
			makePeer( { metrics: { ...makePeer().metrics, gross_margin: 30 } } ),
			makePeer( { metrics: { ...makePeer().metrics, gross_margin: 50 } } ),
		] );
		expect( result?.sample_size ).toBe( 2 );
		expect( result?.metrics.gross_margin ).toEqual( {
			mean: 40,
			min: 30,
			p25: 35,
			median: 40,
			p75: 45,
			max: 50,
		} );
	} );
} );
