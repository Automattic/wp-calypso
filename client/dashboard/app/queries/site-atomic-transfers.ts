import { queryOptions } from '@tanstack/react-query';
import { fetchLatestAtomicTransfer } from '../../data/site-atomic-transfers';

export const siteLatestAtomicTransferQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'atomic', 'transfers', 'latest' ],
		queryFn: () => fetchLatestAtomicTransfer( siteId ),
	} );
