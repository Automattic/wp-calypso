import { siteWordPressPrereleaseQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '../../utils/datetime';
import type { Site, WordPressPrerelease } from '@automattic/api-core';

/** Long enough that moving between site pages reuses the loader's answer instead of refetching it. */
export const PRERELEASE_STALE_TIME = 5 * 60 * 1000;

/** Only production sites on WP Cloud are auto-enrolled, so no other site needs the request. */
export function mayBeAutoEnrolledInWordPressPrerelease(
	site: Pick< Site, 'is_wpcom_atomic' | 'is_wpcom_staging_site' >
) {
	return (
		isEnabled( 'dashboard/wp-beta-program' ) &&
		!! site.is_wpcom_atomic &&
		! site.is_wpcom_staging_site
	);
}

/**
 * Once the release is out every site runs it, and switching back would no longer
 * defer anything, so the auto-enrollment notices end the day before.
 */
export function isAutoEnrolledBeforeRelease( prerelease: WordPressPrerelease, now = Date.now() ) {
	return prerelease.auto_enrolled && now < Date.parse( `${ prerelease.release_date }T00:00:00Z` );
}

/** "7.2 Beta" or "7.2 RC", as WordPress names its pre-releases. */
export function getPrereleaseName( {
	version,
	stage,
}: Pick< WordPressPrerelease, 'version' | 'stage' > ) {
	return `${ version } ${ stage === 'rc' ? 'RC' : 'Beta' }`;
}

/** "December 8" for "2026-12-08". The date is a calendar day, so it is read in UTC to keep it from shifting. */
export function formatReleaseDate( releaseDate: string, locale: string ) {
	return formatDate( new Date( `${ releaseDate }T00:00:00Z` ), locale, {
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC',
	} );
}

/**
 * The pre-release the site was auto-enrolled in, or null when the owner chose the
 * beta track themselves, switched back, or the release is out. Not a suspense query:
 * route loaders settle it, and one they let fail must render nothing rather than throw.
 */
export function useAutoEnrolledWordPressPrerelease(
	site: Site | undefined
): WordPressPrerelease | null {
	const { data } = useQuery( {
		...siteWordPressPrereleaseQuery( site?.ID ?? 0 ),
		enabled: !! site && mayBeAutoEnrolledInWordPressPrerelease( site ),
		staleTime: PRERELEASE_STALE_TIME,
		retryOnMount: false,
	} );
	return data && isAutoEnrolledBeforeRelease( data ) ? data : null;
}
