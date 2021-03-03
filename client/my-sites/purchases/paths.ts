/**
 * Internal Dependencies
 */
import { isEnabled } from '@automattic/calypso-config';

export const getManagePurchaseUrlFor = (
	targetSiteSlug: string,
	targetPurchaseId: string | number
) => `/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchaseId }`;

export const getConfirmCancelDomainUrlFor = (
	targetSiteSlug: string,
	targetPurchaseId: string | number
) => `/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchaseId }/confirm-cancel-domain`;

export const getCancelPurchaseUrlFor = (
	targetSiteSlug: string,
	targetPurchaseId: string | number
) => `/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchaseId }/cancel`;

export const getPurchaseListUrlFor = ( targetSiteSlug: string ) =>
	`/purchases/subscriptions/${ targetSiteSlug }`;

export const getAddPaymentMethodUrlFor = (
	targetSiteSlug: string,
	targetPurchaseId: string | number
) =>
	isEnabled( 'purchases/new-payment-methods' )
		? `/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchaseId }/payment-method/add`
		: `/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchaseId }/payment/add`;

export const getAddNewPaymentMethodUrlFor = ( targetSiteSlug: string ) =>
	isEnabled( 'purchases/new-payment-methods' )
		? `/purchases/add-payment-method/${ targetSiteSlug }`
		: `/purchases/add-credit-card/${ targetSiteSlug }`;

export const getPaymentMethodsUrlFor = ( targetSiteSlug: string ) =>
	`/purchases/payment-methods/${ targetSiteSlug }`;

export const getChangePaymentMethodUrlFor = (
	targetSiteSlug: string,
	targetPurchaseId: string | number,
	targetCardId: string | number
) =>
	isEnabled( 'purchases/new-payment-methods' )
		? `/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchaseId }/payment-method/change/${ targetCardId }`
		: `/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchaseId }/payment/edit/${ targetCardId }`;

export const getReceiptUrlFor = ( targetSiteSlug: string, targetReceiptId: string | number ) =>
	`/purchases/billing-history/${ targetSiteSlug }/${ targetReceiptId }`;

export const getBillingHistoryUrlFor = ( targetSiteSlug: string ) =>
	`/purchases/billing-history/${ targetSiteSlug }`;
