import {
	omnibarSiteIdQuery,
	queryClient,
	siteByIdQuery,
	userPreferenceQuery,
	userPreferenceOptimisticMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouterState } from '@tanstack/react-router';
import { removeQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import { AUTH_QUERY_KEY } from '../auth';
import type { Site, User } from '@automattic/api-core';

function isMemberOfSite( site: Site ) {
	// If the user is a member of the site, the capabilities property will exist
	return !! site.capabilities;
}

/**
 * Initializes the current site for the omnibar, which is extracted from the URL,
 * or the most recent sites, or the user's primary blog, in that priority.
 */
export function useInitializeOmnibarSite() {
	const user = queryClient.getQueryData< User >( AUTH_QUERY_KEY );

	const { data: recentSiteIds, isLoading: isLoadingRecentSiteIds } = useQuery(
		userPreferenceQuery( 'recentSites' ),
		queryClient
	);
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
	const recentSiteId =
		queryClient.getQueryData< number | null >( omnibarSiteIdQuery().queryKey ) ||
		recentSiteIds?.[ 0 ];

	const { data: originSite, isLoading: isLoadingOriginSite } = useQuery( {
		...siteByIdQuery( originSiteId ?? 0 ),
		enabled: !! originSiteId,
	} );

	const { data: recentSite, isLoading: isLoadingRecentSite } = useQuery( {
		...siteByIdQuery( recentSiteId ?? 0 ),
		enabled: !! recentSiteId,
	} );

	useEffect( () => {
		// Wait until the required data are fully loaded, to avoid flicker.
		if ( ! isRouteLoaded || isLoadingRecentSiteIds || isLoadingOriginSite || isLoadingRecentSite ) {
			return;
		}

		// `omnibarSiteIdQuery` is used as cross-tree shared state — its placeholder
		// queryFn resolves to `null`. If it's still in flight when we write here,
		// the resolution will overwrite our value and the omnibar loses the site.
		queryClient.cancelQueries( { queryKey: omnibarSiteIdQuery().queryKey } );

		const omnibarSite = [ routeSite, originSite, recentSite ].find(
			( site ) => site && isMemberOfSite( site )
		);
		const omnibarSiteId = omnibarSite?.ID ?? user?.primary_blog;
		queryClient.setQueryData( omnibarSiteIdQuery().queryKey, () => omnibarSiteId );

		// Remove the `origin_site_id` query param from the URL.
		if ( originSiteId ) {
			window.history.replaceState(
				null,
				'',
				removeQueryArgs( window.location.pathname + window.location.search, 'origin_site_id' )
			);
		}

		if ( omnibarSiteId && omnibarSiteId !== recentSiteIds?.[ 0 ] ) {
			updateRecentSites(
				[ ...new Set( [ omnibarSiteId, ...( recentSiteIds || [] ) ] ) ].slice( 0, 5 )
			);
		}
	}, [
		isRouteLoaded,
		routeSite,
		originSiteId,
		originSite,
		isLoadingOriginSite,
		recentSite,
		isLoadingRecentSite,
		recentSiteIds,
		isLoadingRecentSiteIds,
		user,
		updateRecentSites,
	] );
}
