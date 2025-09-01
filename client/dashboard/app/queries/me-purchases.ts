import {
	fetchUserPurchases,
	fetchUserTransferredPurchases,
	setPurchaseAutoRenew,
	fetchPurchase,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from '../query-client';

export const userPurchasesQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'purchases' ],
		queryFn: () => fetchUserPurchases(),
	} );

export function userTransferredPurchasesQuery() {
	return queryOptions( {
		queryKey: [ 'me', 'purchases', 'transferred' ],
		queryFn: () => fetchUserTransferredPurchases(),
	} );
}

export const purchaseQuery = ( purchaseId: number ) =>
	queryOptions( {
		queryKey: [ 'me', 'purchases', purchaseId ],
		queryFn: () => fetchPurchase( purchaseId ),
	} );

export const userPurchaseSetAutoRenewQuery = ( purchaseId: number ) =>
	mutationOptions( {
		mutationFn: ( autoRenew: boolean ) => setPurchaseAutoRenew( purchaseId, autoRenew ),
		onSuccess: ( data ) => {
			queryClient.setQueryData( purchaseQuery( purchaseId ).queryKey, data.upgrade );
		},
	} );
