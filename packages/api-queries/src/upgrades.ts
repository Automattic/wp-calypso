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
	fetchPurchaseSiteTransferPreview,
	transferPurchaseToSite,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { sitesQueryKey } from './sites';
import type {
	AssignPaymentMethodParams,
	PurchaseCancelOptions,
	PurchaseDowngradeOptions,
	SiteTransferRequest,
} from '@automattic/api-core';

export const userPurchasesQuery = () =>
	queryOptions( {
		queryKey: [ 'upgrades' ],
		queryFn: () => fetchUserPurchases(),
		meta: { persist: false },
	} );

export function userTransferredPurchasesQuery() {
	return queryOptions( {
		queryKey: [ 'upgrades', 'transferred' ],
		queryFn: () => fetchUserTransferredPurchases(),
		meta: { persist: false },
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
		meta: { persist: false },
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
	variant: 'control' | 'treatment' = 'treatment',
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
		// Returning the promise keeps the mutation pending until the purchases are
		// refetched, so callers never show the old auto-renew value in between.
		onSuccess: () => queryClient.invalidateQueries( userPurchasesQuery() ),
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
				{ enabled: true; toProductId: number } | { enabled: false }
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

/**
 * What moving a purchase to another site would do. The preview carries a state
 * token that the transfer must send back, so it is never served from a stale
 * cache entry.
 */
export const purchaseSiteTransferPreviewQuery = ( purchaseId: number, targetBlogId: number ) =>
	queryOptions( {
		queryKey: [ 'upgrades', purchaseId, 'site-transfer-preview', targetBlogId ],
		queryFn: () => fetchPurchaseSiteTransferPreview( purchaseId, targetBlogId ),
		staleTime: 0,
		gcTime: 0,
	} );

export const purchaseSiteTransferMutation = ( purchaseId: number ) =>
	mutationOptions( {
		meta: { statId: 'purch-site-transfer' },
		mutationFn: ( request: SiteTransferRequest ) => transferPurchaseToSite( purchaseId, request ),
		onSuccess: () => {
			// Purchases, plans and domains all change site, so refresh everything
			// that reports which site has what.
			queryClient.invalidateQueries( userPurchasesQuery() );
			queryClient.invalidateQueries( { queryKey: sitesQueryKey } );
			queryClient.invalidateQueries( { queryKey: [ 'site-by-id' ] } );
			queryClient.invalidateQueries( { queryKey: [ 'site-by-slug' ] } );
			queryClient.invalidateQueries( { queryKey: [ 'site' ] } );
			queryClient.invalidateQueries( { queryKey: [ 'domains' ] } );
		},
	} );
