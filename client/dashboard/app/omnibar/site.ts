import { omnibarSiteIdQuery, queryClient } from '@automattic/api-queries';
import { useRouter } from '@tanstack/react-router';
import { removeQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import type { Site } from '@automattic/api-core';

function isMemberOfSite( site: Site ) {
	// If the user is a member of the site, the capabilities property will exist
	return !! site.capabilities;
}

/**
 * Keeps the omnibar's current site in sync with the URL.
 */
export function useSyncOmnibarSite() {
	const router = useRouter();

	useEffect( () => {
		function syncOmnibarSite() {
			const routeSite = router.state.matches.findLast(
				( match ) => !! ( match.loaderData as { site?: Site } )?.site
			)?.loaderData?.site;

			// When coming from a site's wp-admin, the URL may contain an `origin_site_id` query param.
			const originSiteIdParam = Number(
				( router.state.location.search as Record< string, string | undefined > ).origin_site_id
			);
			const originSiteId = originSiteIdParam > 0 ? originSiteIdParam : undefined;

			const omnibarSiteId = routeSite && isMemberOfSite( routeSite ) ? routeSite.ID : null;

			queryClient.setQueryData( omnibarSiteIdQuery().queryKey, () => omnibarSiteId );

			// Remove the `origin_site_id` query param from the URL.
			if ( originSiteId ) {
				window.history.replaceState(
					null,
					'',
					removeQueryArgs( window.location.pathname + window.location.search, 'origin_site_id' )
				);
			}
		}

		syncOmnibarSite();

		return router.subscribe( 'onResolved', syncOmnibarSite );
	}, [ router ] );
}
