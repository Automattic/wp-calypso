import { useQuery, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { MigrationEnabledResponse } from './types';
import type { SiteId, URL } from 'calypso/types';
/**
 * Fetches migration enabled information for a specific target site and source site.
 *
 * @param targetSiteId - The ID of the target site.
 * @param sourcSite - The ID or URL of the source site.
 * @param enabled - Optional flag to enable/disable the query. Default is true.
 * @returns The migration enabled information query result.
 */
export const useMigrationEnabledInfoQuery = (
	targetSiteId: SiteId,
	sourcSite: SiteId | URL,
	enabled = true,
	onSuccessCallback?: ( data: MigrationEnabledResponse ) => void,
	onErrorCallback?: () => void
) => {
	const queryClient = useQueryClient();
	const queryKey = [
		'migration-enabled',
		{
			sourcSite,
			targetSiteId,
		},
	];

	return useQuery( {
		queryKey,
		queryFn: (): Promise< MigrationEnabledResponse > =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2/',
				path: `sites/${ targetSiteId }/migration-enabled/${ encodeURIComponent( sourcSite ) }`,
			} ),
		meta: {
			persist: false,
		},
		enabled: !! ( enabled && targetSiteId && sourcSite ),
		retry: false,
		onSuccess: onSuccessCallback,
		onError: () => {
			// Clear data on error
			queryClient.setQueryData( queryKey, null );
			onErrorCallback && onErrorCallback();
		},
	} );
};
