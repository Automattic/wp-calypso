import {
	omnibarSiteIdQuery,
	queryClient,
	userPreferenceQuery,
	userPreferenceOptimisticMutation,
} from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouterState } from '@tanstack/react-router';
import { removeQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import { AUTH_QUERY_KEY } from '../auth';
import type { Site, User } from '@automattic/api-core';

/**
 * Initializes the current site for the omnibar, which is extracted from the URL,
 * or the most recent sites, or the user's primary blog, in that priority.
 */
export function useInitializeOmnibarSite() {
	const user = queryClient.getQueryData< User >( AUTH_QUERY_KEY );

	const { data: recentSiteIds } = useQuery( userPreferenceQuery( 'recentSites' ), queryClient );
	const { mutate: updateRecentSites } = useMutation(
		userPreferenceOptimisticMutation( 'recentSites' ),
		queryClient
	);

	const { location, routeSite, isRouteLoaded } = useRouterState( {
		select: ( state ) => ( {
			location: state.location,
			routeSite: state.matches.findLast(
				( match ) => !! ( match.loaderData as { site?: Site } )?.site
			)?.loaderData?.site,
			isRouteLoaded: state.status !== 'pending',
		} ),
	} );

	// When coming from a site's wp-admin, the URL may contain an `origin_site_id` query param.
	const originSiteIdParam = Number(
		( location.search as Record< string, string | undefined > ).origin_site_id
	);
	const originSiteId = originSiteIdParam > 0 ? originSiteIdParam : undefined;

	const selectedSiteId = routeSite?.ID || originSiteId;
	const fallbackSiteId = recentSiteIds?.[ 0 ] || user?.primary_blog;

	useEffect( () => {
		if ( ! isEnabled( 'dashboard/omnibar' ) ) {
			return;
		}

		// Wait until the route and recent sites are fully loaded, to avoid flicker.
		if ( ! isRouteLoaded || ! recentSiteIds ) {
			return;
		}

		// `omnibarSiteIdQuery` is used as cross-tree shared state — its placeholder
		// queryFn resolves to `null`. If it's still in flight when we write here,
		// the resolution will overwrite our value and the omnibar loses the site.
		queryClient.cancelQueries( { queryKey: omnibarSiteIdQuery().queryKey } );
		queryClient.setQueryData(
			omnibarSiteIdQuery().queryKey,
			( currentSiteId ) => selectedSiteId || currentSiteId || fallbackSiteId
		);

		// Remove the `origin_site_id` query param from the URL.
		if ( originSiteId ) {
			window.history.replaceState(
				null,
				'',
				removeQueryArgs( window.location.pathname + window.location.search, 'origin_site_id' )
			);
		}

		// Push the selected site id as the most recent site.
		if ( selectedSiteId && selectedSiteId !== recentSiteIds[ 0 ] ) {
			updateRecentSites( [ ...new Set( [ selectedSiteId, ...recentSiteIds ] ) ].slice( 0, 5 ) );
		}
	}, [
		isRouteLoaded,
		originSiteId,
		selectedSiteId,
		fallbackSiteId,
		recentSiteIds,
		updateRecentSites,
	] );
}
