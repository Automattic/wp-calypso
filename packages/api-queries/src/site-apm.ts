import { fetchSiteApmAggregate, updateApmEnabled } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';
import type { ApmAggregateParams, Site } from '@automattic/api-core';

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

/**
 * Query the APM aggregate for a window that ends at "now". The query key is
 * derived from the window size rather than absolute timestamps, so background
 * refetches (e.g. via `refetchInterval`) reuse the same cache entry as the
 * window slides forward instead of fragmenting the cache by timestamp. The
 * fetcher computes a fresh start/end on every call, snapping to the current
 * minute boundary so adjacent fetches within the same minute share a URL.
 */
export const siteApmAggregateRollingQuery = ( siteId: number, windowSec: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'apm', 'aggregate-rolling', windowSec ],
		queryFn: () => {
			const end = snapToMinute( Math.floor( Date.now() / 1000 ) );
			const start = end - windowSec;
			return fetchSiteApmAggregate( siteId, { start, end } );
		},
		staleTime: 60_000,
	} );
