/**
 * Internal Dependencies
 */
import { isEnabled } from 'calypso/config';

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
	targetPurchase: { id: string | number }
) =>
	isEnabled( 'purchases/new-payment-methods' )
		? `/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchase }/payment-method/add`
		: `/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchase }/payment/add`;

export const getAddNewPaymentMethod = ( targetSiteSlug: string ) =>
	isEnabled( 'purchases/new-payment-methods' )
		? `/purchases/add-payment-method/${ targetSiteSlug }`
		: `/purchases/add-credit-card/${ targetSiteSlug }`;

export const getPaymentMethodsUrlFor = ( targetSiteSlug: string ) =>
	`/purchases/payment-methods/${ targetSiteSlug }`;

export const getChangePaymentMethodUrlFor = (
	targetSiteSlug: string,
	targetPurchase: { id: string | number },
	targetCardId: { id: string | number }
) =>
	isEnabled( 'purchases/new-payment-methods' )
		? `/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchase }/payment-method/change/${ targetCardId }`
		: `/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchase }/payment/edit/${ targetCardId }`;

export const getReceiptUrlFor = ( targetSiteSlug: string, targetReceiptId: string | number ) =>
	`/purchases/billing-history/${ targetSiteSlug }/${ targetReceiptId }`;

export const getBillingHistoryUrlFor = ( targetSiteSlug: string ) =>
	`/purchases/billing-history/${ targetSiteSlug }`;
