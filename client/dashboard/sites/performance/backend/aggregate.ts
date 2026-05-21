import type { ApmAggregateBucket, ApmSummary, ApmTimePoint } from '@automattic/api-core';

export interface MergedRoute {
	id: string;
	method: string;
	route: string;
	tx_count: number;
	duration_ms: { sum: number; avg: number; max: number };
}

export interface MergedDbQuery {
	id: string;
	fingerprint: string;
	fingerprint_id: string;
	op: string;
	table?: string;
	count: number;
	self_sum_ms: number;
	avg_ms: number;
	max_ms: number;
}

export interface MergedExternal {
	id: string;
	method: string;
	host: string;
	count: number;
	self_sum_ms: number;
	avg_ms: number;
	max_ms: number;
}

export interface MergedPlugin {
	id: string;
	name: string;
	count: number;
	self_sum_ms: number;
	max_ms: number;
}

export interface MergedHook {
	id: string;
	action: string;
	count: number;
	total_sum_ms: number;
	max_ms: number;
}

export interface MergedTemplate {
	id: string;
	name: string;
	count: number;
	total_sum_ms: number;
	max_ms: number;
}

export interface MergedSlowest {
	routes: MergedRoute[];
	db_queries: MergedDbQuery[];
	externals: MergedExternal[];
	plugins: MergedPlugin[];
	hooks: MergedHook[];
	templates: MergedTemplate[];
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

function mergeDbQueries( buckets: ApmAggregateBucket[] ): MergedDbQuery[] {
	const map = new Map< string, MergedDbQuery >();
	for ( const bucket of buckets ) {
		for ( const query of bucket.extra.slowest.db_queries ) {
			const id = query.fingerprint_id;
			const existing = map.get( id );
			if ( existing ) {
				existing.count += query.count;
				existing.self_sum_ms += query.self_sum_ms;
				existing.max_ms = Math.max( existing.max_ms, query.max_wallclock_ms );
				existing.avg_ms = existing.self_sum_ms / Math.max( existing.count, 1 );
			} else {
				map.set( id, {
					id,
					fingerprint: query.fingerprint,
					fingerprint_id: query.fingerprint_id,
					op: query.op,
					table: query.table,
					count: query.count,
					self_sum_ms: query.self_sum_ms,
					avg_ms: query.self_sum_ms / Math.max( query.count, 1 ),
					max_ms: query.max_wallclock_ms,
				} );
			}
		}
	}
	return Array.from( map.values() ).sort( ( a, b ) => b.max_ms - a.max_ms );
}

function mergeExternals( buckets: ApmAggregateBucket[] ): MergedExternal[] {
	const map = new Map< string, MergedExternal >();
	for ( const bucket of buckets ) {
		for ( const external of bucket.extra.slowest.externals ) {
			const id = `${ external.method } ${ external.host }`;
			const existing = map.get( id );
			if ( existing ) {
				existing.count += external.count;
				existing.self_sum_ms += external.self_sum_ms;
				existing.max_ms = Math.max( existing.max_ms, external.max_wallclock_ms );
				existing.avg_ms = existing.self_sum_ms / Math.max( existing.count, 1 );
			} else {
				map.set( id, {
					id,
					method: external.method,
					host: external.host,
					count: external.count,
					self_sum_ms: external.self_sum_ms,
					avg_ms: external.self_sum_ms / Math.max( external.count, 1 ),
					max_ms: external.max_wallclock_ms,
				} );
			}
		}
	}
	return Array.from( map.values() ).sort( ( a, b ) => b.max_ms - a.max_ms );
}

function mergePlugins( buckets: ApmAggregateBucket[] ): MergedPlugin[] {
	const map = new Map< string, MergedPlugin >();
	for ( const bucket of buckets ) {
		for ( const plugin of bucket.extra.slowest.plugins ) {
			const existing = map.get( plugin.name );
			if ( existing ) {
				existing.count += plugin.count;
				existing.self_sum_ms += plugin.self_sum_ms;
				existing.max_ms = Math.max( existing.max_ms, plugin.max_wallclock_ms );
			} else {
				map.set( plugin.name, {
					id: plugin.name,
					name: plugin.name,
					count: plugin.count,
					self_sum_ms: plugin.self_sum_ms,
					max_ms: plugin.max_wallclock_ms,
				} );
			}
		}
	}
	return Array.from( map.values() ).sort( ( a, b ) => b.self_sum_ms - a.self_sum_ms );
}

function mergeHooks( buckets: ApmAggregateBucket[] ): MergedHook[] {
	const map = new Map< string, MergedHook >();
	for ( const bucket of buckets ) {
		for ( const hook of bucket.extra.slowest.hooks ) {
			const existing = map.get( hook.action );
			if ( existing ) {
				existing.count += hook.count;
				existing.total_sum_ms += hook.total_sum_ms;
				existing.max_ms = Math.max( existing.max_ms, hook.max_wallclock_ms );
			} else {
				map.set( hook.action, {
					id: hook.action,
					action: hook.action,
					count: hook.count,
					total_sum_ms: hook.total_sum_ms,
					max_ms: hook.max_wallclock_ms,
				} );
			}
		}
	}
	return Array.from( map.values() ).sort( ( a, b ) => b.total_sum_ms - a.total_sum_ms );
}

function mergeTemplates( buckets: ApmAggregateBucket[] ): MergedTemplate[] {
	const map = new Map< string, MergedTemplate >();
	for ( const bucket of buckets ) {
		for ( const template of bucket.extra.slowest.templates ) {
			const existing = map.get( template.name );
			if ( existing ) {
				existing.count += template.count;
				existing.total_sum_ms += template.total_sum_ms;
				existing.max_ms = Math.max( existing.max_ms, template.max_wallclock_ms );
			} else {
				map.set( template.name, {
					id: template.name,
					name: template.name,
					count: template.count,
					total_sum_ms: template.total_sum_ms,
					max_ms: template.max_wallclock_ms,
				} );
			}
		}
	}
	return Array.from( map.values() ).sort( ( a, b ) => b.total_sum_ms - a.total_sum_ms );
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
			db_queries: mergeDbQueries( aggregates ),
			externals: mergeExternals( aggregates ),
			plugins: mergePlugins( aggregates ),
			hooks: mergeHooks( aggregates ),
			templates: mergeTemplates( aggregates ),
		},
	};
}
