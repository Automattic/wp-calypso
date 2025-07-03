import { fetchLatestAtomicTransfer } from '../../data/site-atomic-transfers';

export const siteLatestAtomicTransferQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'atomic', 'transfers', 'latest' ],
	queryFn: () => fetchLatestAtomicTransfer( siteId ),
} );
