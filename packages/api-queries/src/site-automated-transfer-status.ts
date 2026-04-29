import { fetchSiteAutomatedTransferStatus } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteAutomatedTransferStatusQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'automated-transfers', 'status' ],
		queryFn: () => fetchSiteAutomatedTransferStatus( siteId ),
	} );
