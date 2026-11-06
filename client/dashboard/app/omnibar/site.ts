import { omnibarSiteIdQuery, queryClient } from '@automattic/api-queries';
import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import type { Site } from '@automattic/api-core';

function isMemberOfSite( site: Site ) {
	// If the user is a member of the site, the capabilities property will exist
	return !! site.capabilities;
}

/**
 * Removes the `origin_site_id` param that links from a site's wp-admin add, which nothing reads.
 * Call it before the router reads the URL: removing it afterwards re-runs the page's loaders.
 */
export function removeOriginSiteIdParam() {
	const url = new URL( window.location.href );
	// Not `url.searchParams.delete()`: it rewrites the rest of the query, turning `%20` into a `+`
	// that the router reads as a plus.
	const params = url.search.slice( 1 ).split( '&' );
	const kept = params.filter( ( param ) => ! new URLSearchParams( param ).has( 'origin_site_id' ) );
	if ( kept.length === params.length ) {
		return;
	}
	url.search = kept.join( '&' );
	window.history.replaceState( window.history.state, '', url );
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

			const omnibarSiteId = routeSite && isMemberOfSite( routeSite ) ? routeSite.ID : null;

			queryClient.setQueryData( omnibarSiteIdQuery().queryKey, () => omnibarSiteId );
		}

		syncOmnibarSite();

		return router.subscribe( 'onResolved', syncOmnibarSite );
	}, [ router ] );
}
