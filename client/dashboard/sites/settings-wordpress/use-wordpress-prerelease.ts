import { queryClient, siteWordPressPrereleaseQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import type { Site, WordPressPrerelease } from '@automattic/api-core';

/** Long enough that the page's first render reuses the loader's answer instead of refetching it. */
const STALE_TIME = 5 * 60 * 1000;

/** Only production sites on WP Cloud are picked for early access, so no other site needs the request. */
function canBePickedForEarlyAccess(
	site: Pick< Site, 'is_wpcom_atomic' | 'is_wpcom_staging_site' >
) {
	return (
		isEnabled( 'dashboard/wp-beta-program' ) &&
		!! site.is_wpcom_atomic &&
		! site.is_wpcom_staging_site
	);
}

/**
 * Settles the site's early access state before the page paints, since it decides
 * between the version form and the upsell. Never blocks the page: a failure
 * resolves to undefined and the plan alone decides.
 */
export async function ensureWordPressPrereleaseData(
	site: Pick< Site, 'ID' | 'is_wpcom_atomic' | 'is_wpcom_staging_site' >
): Promise< WordPressPrerelease | undefined > {
	if ( ! canBePickedForEarlyAccess( site ) ) {
		return undefined;
	}
	return queryClient
		.fetchQuery( {
			...siteWordPressPrereleaseQuery( site.ID ),
			staleTime: STALE_TIME,
			retry: false,
		} )
		.catch( () => undefined );
}

/**
 * Not a suspense query: the route loader settles it, and one it let fail must
 * leave the plan to decide rather than throw.
 */
export function useWordPressPrerelease( site: Site ): WordPressPrerelease | undefined {
	const { data } = useQuery( {
		...siteWordPressPrereleaseQuery( site.ID ),
		enabled: canBePickedForEarlyAccess( site ),
		staleTime: STALE_TIME,
		retryOnMount: false,
	} );
	return data;
}
