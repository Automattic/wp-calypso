import {
	fetchUserPurchases,
	setPurchaseAutoRenew,
	fetchPurchase,
	assignPaymentMethod,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type { AssignPaymentMethodParams } from '@automattic/api-core';

export const userPurchasesQuery = () =>
	queryOptions( {
		queryKey: [ 'upgrades' ],
		queryFn: () => fetchUserPurchases(),
	} );

export const purchaseQuery = ( purchaseId: number ) =>
	queryOptions( {
		queryKey: [ 'upgrades', purchaseId ],
		queryFn: () => fetchPurchase( purchaseId ),
	} );

export const userPurchaseSetAutoRenewQuery = ( purchaseId: number ) =>
	mutationOptions( {
		mutationFn: ( autoRenew: boolean ) => setPurchaseAutoRenew( purchaseId, autoRenew ),
		onSuccess: ( data ) => {
			queryClient.setQueryData( purchaseQuery( purchaseId ).queryKey, data.upgrade );
		},
	} );

export const assignPaymentMethodMutation = () =>
	mutationOptions( {
		mutationFn: ( params: AssignPaymentMethodParams ) => assignPaymentMethod( params ),
	} );
