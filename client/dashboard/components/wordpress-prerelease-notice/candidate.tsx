import { siteBySlugQuery, userPreferenceQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouterState } from '@tanstack/react-router';
import { useAnalytics } from '../../app/analytics';
import { WordPressPrereleaseNotice, getDismissalPreferenceName } from './notice';
import { useAutoEnrolledWordPressPrerelease } from './use-auto-enrolled-prerelease';
import type { ReactNode } from 'react';

/** `siteRoute`'s id in `app/router/sites`; every site page's route id starts with it. */
const SITE_ROUTE_ID = '/sites/$siteSlug';

/**
 * The short notice telling an auto-enrolled site's owner that it runs a WordPress
 * pre-release, as an arbiter candidate, or null off site pages, for other sites,
 * and once dismissed for this release. Its data is settled by
 * `ensureWordPressPrereleaseNoticeData` in the site route's loader.
 */
export function useWordPressPrereleaseNoticeCandidate(): {
	node: ReactNode;
	isUrgent: boolean;
} | null {
	const siteSlug = useRouterState( {
		select: ( routerState ) => {
			const leaf = routerState.matches.at( -1 );
			const routeId = leaf?.routeId ?? '';
			if ( routeId !== SITE_ROUTE_ID && ! routeId.startsWith( SITE_ROUTE_ID + '/' ) ) {
				return '';
			}
			return ( leaf?.params as { siteSlug?: string } | undefined )?.siteSlug ?? '';
		},
	} );
	const { data: site } = useQuery( { ...siteBySlugQuery( siteSlug ), enabled: siteSlug !== '' } );
	const prerelease = useAutoEnrolledWordPressPrerelease( site );
	const { data: dismissedVersion } = useQuery( {
		...userPreferenceQuery( getDismissalPreferenceName( site?.ID ?? 0 ) ),
		enabled: !! prerelease,
	} );
	const { recordTracksEvent } = useAnalytics();

	if ( ! site || ! prerelease || dismissedVersion === prerelease.version ) {
		return null;
	}

	return {
		isUrgent: false,
		node: (
			<WordPressPrereleaseNotice
				site={ site }
				prerelease={ prerelease }
				recordTracksEvent={ recordTracksEvent }
			/>
		),
	};
}
