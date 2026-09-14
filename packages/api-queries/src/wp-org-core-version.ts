import { fetchWpOrgCoreVersion } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const wpOrgCoreVersionQuery = ( channel: string = 'latest' ) =>
	queryOptions( {
		queryKey: [ 'wp-org-core-version', channel ],
		queryFn: () => fetchWpOrgCoreVersion( channel ),
		staleTime: 1000 * 60 * 60 * 24,
	} );
