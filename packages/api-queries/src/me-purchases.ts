import { fetchUserTransferredPurchases } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export function userTransferredPurchasesQuery() {
	return queryOptions( {
		queryKey: [ 'me', 'purchases', 'transferred' ],
		queryFn: () => fetchUserTransferredPurchases(),
	} );
}
