import { queryOptions } from '@tanstack/react-query';
import { fetchTransferredPurchases } from '../../data/me-transferred-purchases';

const queryKey = 'transferred-purchases';

export function transferredPurchasesQuery( { isLoggedOut }: { isLoggedOut?: boolean } ) {
	return queryOptions( {
		queryKey: [ queryKey ],
		queryFn: () => fetchTransferredPurchases(),
		enabled: ! isLoggedOut,
	} );
}
