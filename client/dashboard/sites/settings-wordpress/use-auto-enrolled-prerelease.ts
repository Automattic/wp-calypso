import { queryClient, siteWordPressPrereleaseQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import type { Site, WordPressPrerelease } from '@automattic/api-core';

/** Long enough that the page's first render reuses the loader's answer instead of refetching it. */
const STALE_TIME = 5 * 60 * 1000;

/** Only production sites on WP Cloud are auto-enrolled, so no other site needs the request. */
function mayBeAutoEnrolled( site: Pick< Site, 'is_wpcom_atomic' | 'is_wpcom_staging_site' > ) {
	return (
		isEnabled( 'dashboard/wp-beta-program' ) &&
		!! site.is_wpcom_atomic &&
		! site.is_wpcom_staging_site
	);
}

/**
 * Once the release is out every site runs it, and switching back would no longer
 * defer anything, so the auto-enrollment notice ends the day before.
 */
export function isAutoEnrolledBeforeRelease( prerelease: WordPressPrerelease, now = Date.now() ) {
	return prerelease.auto_enrolled && now < Date.parse( `${ prerelease.release_date }T00:00:00Z` );
}

/**
 * Settles whether the site was auto-enrolled before the page paints, so the
 * notice doesn't pop in. Never blocks the page: a failure is swallowed and the
 * notice stays hidden.
 */
export async function ensureAutoEnrolledPrereleaseData(
	site: Pick< Site, 'ID' | 'is_wpcom_atomic' | 'is_wpcom_staging_site' >
): Promise< void > {
	if ( ! mayBeAutoEnrolled( site ) ) {
		return;
	}
	await queryClient
		.fetchQuery( {
			...siteWordPressPrereleaseQuery( site.ID ),
			staleTime: STALE_TIME,
			retry: false,
		} )
		.catch( () => undefined );
}

/**
 * The pre-release the site was auto-enrolled in, or null when the owner chose the
 * beta track themselves, switched back, or the release is out. Not a suspense query:
 * the route loader settles it, and one it let fail must render nothing rather than throw.
 */
export function useAutoEnrolledPrerelease( site: Site ): WordPressPrerelease | null {
	const { data } = useQuery( {
		...siteWordPressPrereleaseQuery( site.ID ),
		enabled: mayBeAutoEnrolled( site ),
		staleTime: STALE_TIME,
		retryOnMount: false,
	} );
	return data && isAutoEnrolledBeforeRelease( data ) ? data : null;
}
