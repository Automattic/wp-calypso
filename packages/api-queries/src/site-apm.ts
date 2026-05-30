import { fetchSiteApmAggregate, fetchSiteApmDetail, updateApmEnabled } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';
import type {
	ApmAggregateBucket,
	ApmAggregateParams,
	ApmAggregateResponse,
	Site,
} from '@automattic/api-core';

// Snap a Unix-seconds timestamp down to the start of the current minute.
// APM data is bucketed per minute, so snapping keeps fetches within the same
// minute hitting the same URL (and HTTP cache).
function snapToMinute( sec: number ): number {
	return sec - ( sec % 60 );
}

export const siteApmEnabledMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( active: boolean ) => updateApmEnabled( siteId, active ),
		onSuccess: ( _data, active ) => {
			queryClient.setQueriesData< Site >( siteQueryFilter( siteId ), ( site ) =>
				site
					? {
							...site,
							options: { ...site.options, apm_enabled: active } as Site[ 'options' ],
					  }
					: site
			);
		},
	} );

export const siteApmAggregateQuery = ( siteId: number, params?: ApmAggregateParams ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'apm', 'aggregate', params ],
		queryFn: () => fetchSiteApmAggregate( siteId, params ),
		// Data is bucketed per minute and ingestion lags ~30s; keep cached
		// data fresh for a minute so remounts don't trigger silent refetches.
		staleTime: 60_000,
	} );

function bucketSec( bucket: ApmAggregateBucket ): number {
	return Math.floor( new Date( bucket.extra.bucket_minute ).getTime() / 1000 );
}

/**
 * Query the APM aggregate for a window that ends at "now". The query key is
 * derived from the window size rather than absolute timestamps, so background
 * refetches (e.g. via `refetchInterval`) reuse the same cache entry as the
 * window slides forward instead of fragmenting the cache by timestamp.
 *
 * On first fetch the queryFn pulls the whole window. On subsequent fetches it
 * asks the API for buckets strictly after the latest cached `bucket_minute`,
 * so the delta never re-downloads buckets we already have. The response is
 * appended to the cached aggregates and any buckets that have fallen off the
 * back of the window are dropped, keeping the cache bounded.
 */
export const siteApmAggregateRollingQuery = ( siteId: number, windowSec: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'apm', 'aggregate-rolling', windowSec ],
		queryFn: async ( { queryKey } ) => {
			const end = snapToMinute( Math.floor( Date.now() / 1000 ) );
			const windowStart = end - windowSec;
			const cached = queryClient.getQueryData< ApmAggregateResponse >( queryKey );

			if ( ! cached || cached.aggregates.length === 0 ) {
				return fetchSiteApmAggregate( siteId, { start: windowStart, end } );
			}

			// Start one second past the latest cached bucket so the API never
			// resends a bucket we already have. Buckets are minute-aligned, so
			// any non-zero offset is enough to skip the previous one.
			const latestSec = cached.aggregates.reduce(
				( max, b ) => Math.max( max, bucketSec( b ) ),
				0
			);
			const deltaStart = latestSec + 1;

			if ( deltaStart > end ) {
				// We're still in the minute of the latest cached bucket; no new
				// bucket to fetch. Just trim buckets that have fallen off the
				// back of the window.
				return {
					...cached,
					aggregates: cached.aggregates.filter( ( b ) => bucketSec( b ) >= windowStart ),
				};
			}

			const delta = await fetchSiteApmAggregate( siteId, { start: deltaStart, end } );

			// Delta buckets are strictly newer than every cached bucket, so we
			// can concatenate without deduping. Trim cached to the window.
			const merged = [
				...delta.aggregates,
				...cached.aggregates.filter( ( b ) => bucketSec( b ) >= windowStart ),
			];
			return { ...cached, aggregates: merged };
		},
		staleTime: 60_000,
	} );

// Per-route APM detail (one document per minute the route shipped a detail
// doc). Keyed by windowSec so the entry survives the window sliding forward.
export const siteApmDetailQuery = (
	siteId: number,
	params: { method: string; route: string; windowSec: number }
) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'apm', 'detail', params.method, params.route, params.windowSec ],
		queryFn: () => {
			const end = snapToMinute( Math.floor( Date.now() / 1000 ) );
			return fetchSiteApmDetail( siteId, {
				method: params.method,
				route: params.route,
				start: end - params.windowSec,
				end,
			} );
		},
		staleTime: 60_000,
	} );
