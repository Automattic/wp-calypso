import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { MigrationEnabledResponse } from './types';
import type { SiteId, URL } from 'calypso/types';

/**
 * Fetches migration enabled information for a specific target site and source site.
 * @param targetSiteId - The ID of the target site.
 * @param sourceSite - The ID or URL of the source site.
 * @param enabled - Optional flag to enable/disable the query. Default is true.
 * @returns The migration enabled information query result.
 */
export const useMigrationEnabledInfoQuery = (
	targetSiteId: SiteId,
	sourceSite: SiteId | URL,
	enabled = true
) => {
	return useQuery< MigrationEnabledResponse >( {
		queryKey: [
			'migration-enabled',
			{
				sourceSite,
				targetSiteId,
			},
		],
		queryFn: () =>
			wpcom.req.get( {
				path: `/sites/${ targetSiteId }/migration-enabled/${ encodeURIComponent( sourceSite ) }`,
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
		enabled: !! ( enabled && targetSiteId && sourceSite ),
		retry: false,
		refetchOnWindowFocus: false,
		select( data ) {
			return {
				...data,
				can_migrate: !! (
					( data.migration_activated && data.migration_compatible ) ||
					( data.jetpack_activated && data.jetpack_compatible )
				),
			};
		},
	} );
};
