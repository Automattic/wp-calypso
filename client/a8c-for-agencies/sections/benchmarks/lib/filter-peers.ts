import { AGGREGATE_METRIC_KEYS } from '../constants';
import type {
	AggregateMetricKey,
	AgencyRegion,
	AgencySize,
	AgencySpecialization,
	MetricSummary,
	PeerBenchmarkRow,
} from '../constants';

export const BUCKET_ALL = 'all';
export const BUCKET_UNKNOWN = 'unknown';

export type SizeFilter = AgencySize | typeof BUCKET_ALL | typeof BUCKET_UNKNOWN;
export type RegionFilter = AgencyRegion | typeof BUCKET_ALL | typeof BUCKET_UNKNOWN;
export type SpecializationFilter = AgencySpecialization | typeof BUCKET_ALL | typeof BUCKET_UNKNOWN;

export type PeerFilters = {
	size: SizeFilter;
	region: RegionFilter;
	specialization: SpecializationFilter;
};

export const EMPTY_PEER_FILTERS: PeerFilters = {
	size: BUCKET_ALL,
	region: BUCKET_ALL,
	specialization: BUCKET_ALL,
};

export function isAnyFilterActive( filters: PeerFilters ): boolean {
	return (
		filters.size !== BUCKET_ALL ||
		filters.region !== BUCKET_ALL ||
		filters.specialization !== BUCKET_ALL
	);
}

function matchesScalar< T extends string >(
	value: T | null | undefined,
	filter: T | 'all' | 'unknown'
): boolean {
	if ( filter === BUCKET_ALL ) {
		return true;
	}
	if ( filter === BUCKET_UNKNOWN ) {
		return value == null;
	}
	return value === filter;
}

function matchesSpecialization(
	values: AgencySpecialization[] | undefined,
	filter: SpecializationFilter
): boolean {
	if ( filter === BUCKET_ALL ) {
		return true;
	}
	if ( filter === BUCKET_UNKNOWN ) {
		return ! values || values.length === 0;
	}
	return !! values && values.includes( filter );
}

export function filterPeers( peers: PeerBenchmarkRow[], filters: PeerFilters ): PeerBenchmarkRow[] {
	return peers.filter(
		( peer ) =>
			matchesScalar( peer.agency_size, filters.size ) &&
			matchesScalar( peer.agency_region, filters.region ) &&
			matchesSpecialization( peer.agency_specializations, filters.specialization )
	);
}

const round2 = ( value: number ) => Math.round( value * 100 ) / 100;

// Linear-interpolation percentile over a sorted ascending array, matching the backend's
// 5-number summary. `q` is in [0, 1].
function percentile( sorted: number[], q: number ): number {
	if ( sorted.length === 1 ) {
		return sorted[ 0 ];
	}
	const rank = q * ( sorted.length - 1 );
	const lo = Math.floor( rank );
	const hi = Math.ceil( rank );
	if ( lo === hi ) {
		return sorted[ lo ];
	}
	return sorted[ lo ] + ( rank - lo ) * ( sorted[ hi ] - sorted[ lo ] );
}

export function summarizeMetric( values: number[] ): MetricSummary | null {
	if ( values.length === 0 ) {
		return null;
	}
	const sorted = [ ...values ].sort( ( a, b ) => a - b );
	const mean = sorted.reduce( ( sum, v ) => sum + v, 0 ) / sorted.length;
	return {
		mean: round2( mean ),
		min: round2( sorted[ 0 ] ),
		p25: round2( percentile( sorted, 0.25 ) ),
		median: round2( percentile( sorted, 0.5 ) ),
		p75: round2( percentile( sorted, 0.75 ) ),
		max: round2( sorted[ sorted.length - 1 ] ),
	};
}

export type PeerSummary = {
	sample_size: number;
	metrics: Record< AggregateMetricKey, MetricSummary >;
};

export function summarizePeers( peers: PeerBenchmarkRow[] ): PeerSummary | null {
	if ( peers.length === 0 ) {
		return null;
	}
	const metrics = {} as Record< AggregateMetricKey, MetricSummary >;
	for ( const key of AGGREGATE_METRIC_KEYS ) {
		const values = peers
			.map( ( peer ) => peer.metrics[ key ] )
			.filter( ( v ): v is number => typeof v === 'number' );
		const summary = summarizeMetric( values );
		if ( summary ) {
			metrics[ key ] = summary;
		}
	}
	return { sample_size: peers.length, metrics };
}
