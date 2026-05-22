import { fetchSiteApmAggregate, updateApmEnabled } from '@automattic/api-core';
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
 * issues a delta request from the latest cached bucket onward and merges the
 * response with the cache, so polling stays cheap regardless of window size.
 * Buckets that have fallen off the back of the window are dropped during the
 * merge so the cache stays bounded.
 */
export const siteApmAggregateRollingQuery = ( siteId: number, windowSec: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'apm', 'aggregate-rolling', windowSec ],
		queryFn: async () => {
			const end = snapToMinute( Math.floor( Date.now() / 1000 ) );
			const windowStart = end - windowSec;
			const cached = queryClient.getQueryData< ApmAggregateResponse >( [
				'site',
				siteId,
				'apm',
				'aggregate-rolling',
				windowSec,
			] );

			if ( ! cached || cached.aggregates.length === 0 ) {
				return fetchSiteApmAggregate( siteId, { start: windowStart, end } );
			}

			// The latest cached bucket may still be accumulating data, so the
			// delta refetches from that bucket forward (inclusive) rather than
			// from the next minute.
			const latestSec = cached.aggregates.reduce(
				( max, b ) => Math.max( max, bucketSec( b ) ),
				0
			);
			const delta = await fetchSiteApmAggregate( siteId, { start: latestSec, end } );

			if ( delta.aggregates.length === 0 ) {
				// No new data and no refresh of the latest bucket. Just trim
				// buckets that have fallen off the back of the window.
				return {
					...cached,
					aggregates: cached.aggregates.filter( ( b ) => bucketSec( b ) >= windowStart ),
				};
			}

			// Replace any cached buckets covered by the delta (anything at or
			// after latestSec) with the delta, and drop the ones that have
			// fallen off the back of the window.
			const merged = [
				...delta.aggregates,
				...cached.aggregates.filter( ( b ) => {
					const sec = bucketSec( b );
					return sec >= windowStart && sec < latestSec;
				} ),
			];
			return { ...cached, aggregates: merged };
		},
		staleTime: 60_000,
	} );
