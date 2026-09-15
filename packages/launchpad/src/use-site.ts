import { useQuery } from '@tanstack/react-query';
import wpcomRequest, { canAccessWpcomApis } from './wpcom-request';
import type { LaunchpadSiteDetails } from './site-type';

/**
 * Fetches the handful of site fields Launchpad reads, narrowed to those fields so nothing
 * else about the site is held anywhere. There is no REST fallback, so the request is
 * skipped where the proxy is unavailable and callers see no site, and the result never
 * goes stale — both matching what the site store did here before.
 */
export const useSite = ( siteSlug: string | null ) => {
	const { data } = useQuery< LaunchpadSiteDetails >( {
		queryKey: [ 'launchpad-site', siteSlug ],
		queryFn: async () => {
			const site = await wpcomRequest< LaunchpadSiteDetails >( {
				path: `/sites/${ encodeURIComponent( siteSlug as string ) }`,
				apiVersion: '1.1',
				query: 'force=wpcom',
			} );

			return {
				slug: site?.slug,
				URL: site?.URL,
				options: {
					site_intent: site?.options?.site_intent,
					site_goals: site?.options?.site_goals,
				},
			};
		},
		enabled: Boolean( siteSlug ) && canAccessWpcomApis(),
		staleTime: Infinity,
		meta: { persist: false },
	} );

	return data ?? null;
};
