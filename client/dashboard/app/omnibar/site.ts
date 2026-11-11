import { omnibarCurrentUrlQuery, omnibarSiteIdQuery, queryClient } from '@automattic/api-queries';
import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { redirectToDashboardLink } from '../../utils/link';
import type { Site } from '@automattic/api-core';

function isMemberOfSite( site: Site ) {
	// If the user is a member of the site, the capabilities property will exist
	return !! site.capabilities;
}

/**
 * Keeps the omnibar's current site and current page in sync with the URL.
 */
export function useSyncOmnibarSite() {
	const router = useRouter();

	useEffect( () => {
		function syncOmnibarSite() {
			const routeSite = router.state.matches.findLast(
				( match ) => !! ( match.loaderData as { site?: Site } )?.site
			)?.loaderData?.site;

			const omnibarSiteId = routeSite && isMemberOfSite( routeSite ) ? routeSite.ID : null;

			queryClient.setQueryData( omnibarSiteIdQuery().queryKey, () => omnibarSiteId );

			queryClient.setQueryData( omnibarCurrentUrlQuery().queryKey, () =>
				redirectToDashboardLink( { supportBackport: true } )
			);
		}

		syncOmnibarSite();

		return router.subscribe( 'onResolved', syncOmnibarSite );
	}, [ router ] );
}
