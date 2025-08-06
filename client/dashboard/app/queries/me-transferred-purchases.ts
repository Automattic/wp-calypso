import { queryOptions } from '@tanstack/react-query';
import { fetchTransferredPurchases } from '../../data/me-transferred-purchases';

export function transferredPurchasesQuery() {
	return queryOptions( {
		queryKey: [ 'transferred-purchases' ],
		queryFn: () => fetchTransferredPurchases(),
	} );
}
