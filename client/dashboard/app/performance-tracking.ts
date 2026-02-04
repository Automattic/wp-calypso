import { queryClient } from '@automattic/api-queries';
import { cancel, start, stop } from '@automattic/browser-data-collector';
import config from '@automattic/calypso-config';
import { useLayoutEffect } from 'react';
import { isDashboardBackport } from '../utils/is-dashboard-backport';
import { getSiteFromCache } from './analytics/super-props';
import { AUTH_QUERY_KEY } from './auth';
import type { User } from '@automattic/api-core';
import type { Collector } from '@automattic/browser-data-collector';

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
export function startPerformanceTracking( id: string, { fullPageLoad = false } = {} ) {
	if ( ! config.isEnabled( 'rum-tracking/logstash' ) || isDashboardBackport() ) {
		return;
	}
	cancel( id );
	start( id, { fullPageLoad } );
}

/**
 * Hook to stop performance tracking.
 * Use in functional components where the page is considered "loaded".
 */
export function usePerformanceTrackerStop( id: string, siteSlug?: string ) {
	useLayoutEffect( () => {
		if ( ! config.isEnabled( 'rum-tracking/logstash' ) || isDashboardBackport() ) {
			return;
		}
		requestAnimationFrame( () => {
			stop( id, { collectors: [ buildCollector( siteSlug ) ] } );
		} );
	}, [ id, siteSlug ] );
}

/**
 * Component to stop performance tracking.
 * Place this where the page is considered "loaded".
 */
export function PerformanceTrackerStop( {
	id,
	siteSlug,
}: {
	id: string;
	siteSlug?: string;
} ): null {
	usePerformanceTrackerStop( id, siteSlug );
	return null;
}
