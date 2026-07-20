import {
	fetchUserPurchases,
	setPurchaseAutoRenew,
	fetchPurchase,
	assignPaymentMethod,
	cancelAndRefundPurchase,
	extendPurchaseWithFreeMonth,
	removePurchase,
	hasExtendedPurchase,
	fetchUserTransferredPurchases,
	fetchSitePurchases,
	fetchCancellationFeatures,
	setDelayedDowngrade,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type {
	AssignPaymentMethodParams,
	PurchaseCancelOptions,
	PurchaseDowngradeOptions,
} from '@automattic/api-core';

export const userPurchasesQuery = () =>
	queryOptions( {
		queryKey: [ 'upgrades' ],
		queryFn: () => fetchUserPurchases(),
	} );

export function userTransferredPurchasesQuery() {
	return queryOptions( {
		queryKey: [ 'upgrades', 'transferred' ],
		queryFn: () => fetchUserTransferredPurchases(),
	} );
}

export const sitePurchasesQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'upgrades', 'site', siteId ],
		queryFn: () => fetchSitePurchases( siteId ),
	} );

export const purchaseQuery = ( purchaseId: number ) =>
	queryOptions( {
		queryKey: [ 'upgrades', purchaseId ],
		queryFn: () => fetchPurchase( purchaseId ),
	} );

/**
 * TanStack Query options for fetching features lost when cancelling or
 * downgrading a purchase.
 *
 * Pass `targetProductSlug` to scope the result to the feature delta between
 * the current plan and a specific target plan (e.g. when showing a downgrade
 * confirmation). Without it, all cancellation features for the current plan
 * are returned.
 *
 * `variant` is an A/B experiment parameter; leave it as the default
 * `'control'` unless you are explicitly running an experiment.
 */
export const purchaseCancelFeaturesQuery = (
	purchaseId: number,
	variant: 'control' | 'treatment' = 'control',
	targetProductSlug?: string
) =>
	queryOptions( {
		queryKey: [ 'upgrades', purchaseId, 'cancel-features', variant, targetProductSlug ],
		queryFn: () => fetchCancellationFeatures( purchaseId, variant, targetProductSlug ),
	} );

export const hasPurchaseBeenExtendedQuery = ( purchaseId: number ) =>
	queryOptions( {
		queryKey: [ 'upgrades', purchaseId, 'has-extended' ],
		queryFn: () => hasExtendedPurchase( purchaseId ),
	} );

export const userPurchaseSetAutoRenewQuery = () =>
	mutationOptions( {
		mutationFn: ( { purchaseId, autoRenew }: { purchaseId: number; autoRenew: boolean } ) =>
			setPurchaseAutoRenew( purchaseId, autoRenew ),
		onSuccess: () => {
			queryClient.invalidateQueries( userPurchasesQuery() );
		},
	} );

export const assignPaymentMethodMutation = () =>
	mutationOptions( {
		meta: { statId: 'payment-method-assign' },
		mutationFn: ( params: AssignPaymentMethodParams ) => assignPaymentMethod( params ),
		onSuccess: () => {
			queryClient.invalidateQueries( userPurchasesQuery() );
		},
	} );

export const removePurchaseMutation = () =>
	mutationOptions( {
		meta: { statId: 'purch-remove' },
		mutationFn: removePurchase,
		onSuccess: () => {
			queryClient.invalidateQueries( userPurchasesQuery() );
		},
	} );

export const cancelAndRefundPurchaseMutation = () =>
	mutationOptions( {
		meta: { statId: 'purch-cancel-refund' },
		mutationFn: ( params: {
			purchaseId: number;
			options: PurchaseCancelOptions | PurchaseDowngradeOptions;
		} ) => cancelAndRefundPurchase( params.purchaseId, params.options ),
		onSuccess: () => {
			queryClient.invalidateQueries( userPurchasesQuery() );
		},
	} );

export const extendPurchaseWithFreeMonthMutation = () =>
	mutationOptions( {
		meta: { statId: 'purch-free-month-extend' },
		mutationFn: ( purchaseId: number ) => extendPurchaseWithFreeMonth( purchaseId ),
		onSuccess: () => {
			queryClient.invalidateQueries( userPurchasesQuery() );
		},
	} );

export const setDelayedDowngradeMutation = () =>
	mutationOptions( {
		meta: { statId: 'purch-downgrade-delayed-set' },
		mutationFn: (
			params: { purchaseId: number } & (
				| { enabled: true; toProductId: number }
				| { enabled: false }
			)
		) =>
			setDelayedDowngrade(
				params.purchaseId,
				params.enabled ? { enabled: true, to_product_id: params.toProductId } : { enabled: false }
			),
		onSuccess: ( _data, params ) => {
			queryClient.invalidateQueries( userPurchasesQuery() );
			queryClient.invalidateQueries( purchaseQuery( params.purchaseId ) );
		},
	} );
