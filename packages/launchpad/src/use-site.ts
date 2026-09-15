import { useQuery } from '@tanstack/react-query';
import wpcomRequest, { canAccessWpcomApis } from './wpcom-request';
import type { LaunchpadSiteDetails } from './site-type';

/**
 * Fetches the handful of site fields Launchpad reads, for hosts that don't already
 * have them. There is no REST fallback, so the request is skipped where the proxy is
 * unavailable and callers see no site — matching what the site store did here before.
 */
export const useSite = ( siteSlug: string | null ) => {
	const { data } = useQuery< LaunchpadSiteDetails >( {
		queryKey: [ 'launchpad-site', siteSlug ],
		queryFn: () =>
			wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteSlug as string ) }`,
				apiVersion: '1.1',
				query: 'force=wpcom',
			} ),
		enabled: Boolean( siteSlug ) && canAccessWpcomApis(),
	} );

	return data ?? null;
};
