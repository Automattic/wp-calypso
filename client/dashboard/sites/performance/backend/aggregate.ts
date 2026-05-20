import type { ApmAggregateBucket, ApmSummary, ApmTimePoint } from '@automattic/api-core';

export interface MergedRoute {
	id: string;
	method: string;
	route: string;
	tx_count: number;
	duration_ms: { sum: number; avg: number; max: number };
}

export interface MergedSlowest {
	routes: MergedRoute[];
}

export interface MergedAggregate {
	summary: ApmSummary;
	timeseries: ApmTimePoint[];
	slowest: MergedSlowest;
}

const EMPTY_SUMMARY: ApmSummary = {
	avg_response_ms: 0,
	transaction_count: 0,
	db_avg_ms: 0,
	external_avg_ms: 0,
	plugins_avg_ms: 0,
};

function bucketsToTimePoints( buckets: ApmAggregateBucket[] ): ApmTimePoint[] {
	// API returns newest-first; chart expects chronological order.
	return buckets
		.slice()
		.reverse()
		.map( ( bucket ) => {
			const { bucket_minute, transactions, breakdown_ms } = bucket.extra;
			const count = Math.max( transactions.count, 1 );
			return {
				timestamp: new Date( bucket_minute ).getTime(),
				db: breakdown_ms.db.self_sum / count,
				wp_core: breakdown_ms.wp_core.self_sum / count,
				plugins: breakdown_ms.plugins.self_sum / count,
				external: breakdown_ms.external.self_sum / count,
				cache: breakdown_ms.cache.self_sum / count,
			};
		} );
}

function mergeRoutes( buckets: ApmAggregateBucket[] ): MergedRoute[] {
	const map = new Map< string, MergedRoute >();
	for ( const bucket of buckets ) {
		for ( const route of bucket.extra.slowest.routes ) {
			const id = `${ route.method } ${ route.route }`;
			const existing = map.get( id );
			if ( existing ) {
				existing.tx_count += route.tx_count;
				existing.duration_ms.sum += route.duration_ms.sum;
				existing.duration_ms.max = Math.max( existing.duration_ms.max, route.duration_ms.max );
				existing.duration_ms.avg = existing.duration_ms.sum / Math.max( existing.tx_count, 1 );
			} else {
				map.set( id, {
					id,
					method: route.method,
					route: route.route,
					tx_count: route.tx_count,
					duration_ms: {
						sum: route.duration_ms.sum,
						avg: route.duration_ms.avg,
						max: route.duration_ms.max,
					},
				} );
			}
		}
	}
	return Array.from( map.values() ).sort( ( a, b ) => b.duration_ms.max - a.duration_ms.max );
}

function summarize( buckets: ApmAggregateBucket[] ): ApmSummary {
	if ( buckets.length === 0 ) {
		return EMPTY_SUMMARY;
	}
	let txCount = 0;
	let durationSum = 0;
	let dbSum = 0;
	let pluginsSum = 0;
	let externalSum = 0;
	for ( const bucket of buckets ) {
		const { transactions, breakdown_ms } = bucket.extra;
		txCount += transactions.count;
		durationSum += transactions.duration_ms.sum;
		dbSum += breakdown_ms.db.self_sum;
		pluginsSum += breakdown_ms.plugins.self_sum;
		externalSum += breakdown_ms.external.self_sum;
	}
	const safeCount = Math.max( txCount, 1 );
	return {
		avg_response_ms: Math.round( durationSum / safeCount ),
		transaction_count: txCount,
		db_avg_ms: Math.round( dbSum / safeCount ),
		external_avg_ms: Math.round( externalSum / safeCount ),
		plugins_avg_ms: Math.round( pluginsSum / safeCount ),
	};
}

export function mergeAggregates( aggregates: ApmAggregateBucket[] ): MergedAggregate {
	return {
		summary: summarize( aggregates ),
		timeseries: bucketsToTimePoints( aggregates ),
		slowest: {
			routes: mergeRoutes( aggregates ),
		},
	};
}
