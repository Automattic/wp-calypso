import { useQuery } from '@tanstack/react-query';
import wpcomRequest, { canAccessWpcomApis } from './wpcom-request';
import type { LaunchpadSiteDetails } from './site-type';

/**
 * Fetches the site fields Launchpad reads. The response is the full site; only these
 * fields are cached. Skipped where the proxy is unavailable, since there is no REST
 * fallback, and kept for the session — both matching the site store this replaces.
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
		gcTime: Infinity,
		meta: { persist: false },
	} );

	return data ?? null;
};
