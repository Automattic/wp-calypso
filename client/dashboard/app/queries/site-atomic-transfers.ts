import { fetchLatestAtomicTransfer } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteLatestAtomicTransferQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'atomic', 'transfers', 'latest' ],
		queryFn: () => fetchLatestAtomicTransfer( siteId ),
	} );
