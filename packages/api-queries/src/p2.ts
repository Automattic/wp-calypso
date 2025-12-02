import { fetchP2HubP2s } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const p2HubP2sQuery = ( siteId: number, options: { limit?: number } = {} ) =>
	queryOptions( {
		queryKey: [ 'p2-hub', siteId, 'p2s', options ],
		queryFn: () => fetchP2HubP2s( siteId, options ),
	} );
