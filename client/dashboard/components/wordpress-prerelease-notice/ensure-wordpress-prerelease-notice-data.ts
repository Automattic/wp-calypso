import { queryClient, siteWordPressPrereleaseQuery } from '@automattic/api-queries';
import {
	PRERELEASE_STALE_TIME,
	mayBeAutoEnrolledInWordPressPrerelease,
} from './use-auto-enrolled-prerelease';
import type { Site } from '@automattic/api-core';

/**
 * Settles whether the site was auto-enrolled before a site page paints, so the
 * notice never pops in. Never blocks the page: a failure is swallowed and the
 * notice stays hidden.
 */
export async function ensureWordPressPrereleaseNoticeData(
	site: Pick< Site, 'ID' | 'is_wpcom_atomic' | 'is_wpcom_staging_site' >
): Promise< void > {
	if ( ! mayBeAutoEnrolledInWordPressPrerelease( site ) ) {
		return;
	}
	await queryClient
		.fetchQuery( {
			...siteWordPressPrereleaseQuery( site.ID ),
			staleTime: PRERELEASE_STALE_TIME,
			retry: false,
		} )
		.catch( () => undefined );
}
