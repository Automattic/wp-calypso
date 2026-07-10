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
	const fallbackSiteId =
		queryClient.getQueryData< number | null >( omnibarSiteIdQuery().queryKey ) ||
		recentSiteIds?.[ 0 ];

	useEffect( () => {
		// Wait until the route and recent sites are loaded, to avoid flicker.
		if ( ! isRouteLoaded || isLoadingRecentSiteIds ) {
			return;
		}

		let cancelled = false;

		( async () => {
			// Resolve the omnibar site in priority order, keeping only sites the user
			// is a member of. The route site is already hydrated; the rest are fetched
			// on demand and we stop at the first member, so a crafted or inaccessible
			// candidate is skipped rather than recorded.
			const candidateIds = [ routeSite?.ID, originSiteId, fallbackSiteId ].filter(
				( id ): id is number => !! id
			);

			let member: Site | undefined;
			for ( const id of candidateIds ) {
				const site =
					routeSite?.ID === id
						? routeSite
						: await queryClient.ensureQueryData( siteByIdQuery( id ) ).catch( () => undefined );

				if ( site && isMemberOfSite( site ) ) {
					member = site;
					break;
				}
			}

			if ( cancelled ) {
				return;
			}

			const omnibarSiteId = member?.ID ?? user?.primary_blog;

			// `omnibarSiteIdQuery` is used as cross-tree shared state — its placeholder
			// queryFn resolves to `null`. If it's still in flight when we write here,
			// the resolution will overwrite our value and the omnibar loses the site.
			queryClient.cancelQueries( { queryKey: omnibarSiteIdQuery().queryKey } );
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
		} )();

		return () => {
			cancelled = true;
		};
	}, [
		isRouteLoaded,
		isLoadingRecentSiteIds,
		routeSite,
		originSiteId,
		fallbackSiteId,
		recentSiteIds,
		user,
		updateRecentSites,
	] );
}
