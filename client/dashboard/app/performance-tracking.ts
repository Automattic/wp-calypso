import { queryClient } from '@automattic/api-queries';
import { cancel, start, stop } from '@automattic/browser-data-collector';
import config from '@automattic/calypso-config';
import { useParams, useRouter } from '@tanstack/react-router';
import { useLayoutEffect } from 'react';
import { isDashboardBackport } from '../utils/is-dashboard-backport';
import { getSiteFromCache } from './analytics/super-props';
import { AUTH_QUERY_KEY } from './auth';
import type { User } from '@automattic/api-core';
import type { Collector } from '@automattic/browser-data-collector';

// True until the first page finishes loading (consumed in usePerformanceTrackerStop).
let isFirstLoad = true;

function buildCollector( siteSlug?: string ): Collector {
	const user = queryClient.getQueryData< User >( AUTH_QUERY_KEY );
	const site = siteSlug ? getSiteFromCache( queryClient, siteSlug ) : undefined;

	return ( report ) => {
		report.data.set( 'client', config( 'client_slug' ) );

		if ( user ) {
			report.data.set( 'sitesCount', user.site_count );
			report.data.set( 'userLocale', user.language );
		}

		if ( site ) {
			report.data.set( 'siteId', site.ID );
			report.data.set( 'siteIsJetpack', site.jetpack );
			report.data.set( 'siteIsAtomic', site.is_wpcom_atomic );
		}

		return report;
	};
}

/**
 * Start performance tracking for a page.
 * Call this in a route's beforeLoad handler.
 *
 * We cancel any existing in-flight recording before starting. Exposing `cancel()` from
 * browser-data-collector is not ideal, but it's needed to work around a TanStack Router bug where
 * `cause` in `beforeLoad` gets cached, causing `'enter'` to be reported instead of `'preload'` on
 * hover. This leads to spurious `start()` calls (that we need to cancel) that block subsequent
 * real navigations.
 *
 * The `cancel()` call can be removed when the upstream issue is fixed.
 * @see https://github.com/TanStack/router/issues/3179
 */
/**
 * TanStack Router routeIds have a trailing slash (e.g. "/plugins/manage/")
 * but we want a canonical form without one for metrics.
 */
function normalizeRouteId( routeId?: string ): string {
	return routeId?.replace( /\/$/, '' ) ?? '';
}

export function startPerformanceTracking( routeId: string ) {
	if ( ! config.isEnabled( 'rum-tracking/logstash' ) || isDashboardBackport() ) {
		return;
	}
	const id = normalizeRouteId( routeId );
	cancel( id );
	start( id, { fullPageLoad: isFirstLoad } );
}

/**
 * Hook to stop performance tracking.
 * Use in functional components where the page is considered "loaded".
 */
export function usePerformanceTrackerStop() {
	const { siteSlug } = useParams( { strict: false } );
	const router = useRouter();
	const routeId = ( router.state.pendingMatches ?? router.state.matches ).at( -1 )?.routeId;

	const normalizedRouteId = normalizeRouteId( routeId );

	useLayoutEffect( () => {
		if ( ! config.isEnabled( 'rum-tracking/logstash' ) || isDashboardBackport() ) {
			return;
		}
		// Reset the first-load flag here (not in beforeLoad) so that router
		// redirects (e.g. / → /sites) don't clear it before the final page renders.
		isFirstLoad = false;
		requestAnimationFrame( () => {
			stop( normalizedRouteId, { collectors: [ buildCollector( siteSlug ) ] } );
		} );
	}, [ normalizedRouteId, siteSlug ] );
}

/**
 * Component to stop performance tracking.
 * Place this where the page is considered "loaded".
 */
export function PerformanceTrackerStop() {
	usePerformanceTrackerStop();
	return null;
}
