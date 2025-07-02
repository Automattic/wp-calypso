import { fetchLatestAtomicTransfer } from '../../data/site-atomic-transfers';

export const siteLatestAtomicTransferQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'atomic', 'transfers', 'latest' ],
	queryFn: () => fetchLatestAtomicTransfer( siteId ),
	retry: ( failureCount: number, error: { code?: string } ) => {
		if ( error.code === 'no_transfer_record' ) {
			return false;
		}
		return failureCount < 3;
	},
} );
