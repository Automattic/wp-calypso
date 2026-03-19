import { fetchWpOrgCoreVersionCheck } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const wpOrgCoreVersionCheckQuery = ( channel: string = 'latest' ) =>
	queryOptions( {
		queryKey: [ 'wp-org-core-version-check', channel ],
		queryFn: () => fetchWpOrgCoreVersionCheck( channel ),
		staleTime: 1000 * 60 * 60,
	} );
