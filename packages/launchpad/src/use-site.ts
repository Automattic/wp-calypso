import { useQuery } from '@tanstack/react-query';
import wpcomRequest, { canAccessWpcomApis } from './wpcom-request';
import type { LaunchpadSiteDetails } from './site-type';

/**
 * Fetches the handful of site fields Launchpad reads. There is no REST fallback, so the
 * request is skipped where the proxy is unavailable and callers see no site — matching
 * what the site store did here before. The response is narrowed to the fields we declare
 * and kept out of persisted storage, so nothing else about the site outlives the session.
 */
export const useSite = ( siteSlug: string | null ) => {
	const { data } = useQuery< LaunchpadSiteDetails >( {
		queryKey: [ 'launchpad-site', siteSlug ],
		queryFn: async () => {
			const site: LaunchpadSiteDetails = await wpcomRequest( {
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
		meta: { persist: false },
	} );

	return data ?? null;
};
