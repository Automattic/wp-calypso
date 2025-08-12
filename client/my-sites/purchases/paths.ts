export const getManagePurchaseUrlFor = (
	targetSiteSlug: string,
	targetPurchaseId: string | number
): string => `/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchaseId }`;

export const getMyPurchaseUrlFor = (
	targetSiteSlug: string,
	targetPurchaseId: string | number
): string => `/me/purchases/${ targetSiteSlug }/${ targetPurchaseId }`;

export const getConfirmCancelDomainUrlFor = (
	targetSiteSlug: string,
	targetPurchaseId: string | number
): string =>
	`/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchaseId }/confirm-cancel-domain`;

export const getCancelPurchaseUrlFor = (
	targetSiteSlug: string,
	targetPurchaseId: string | number
): string => `/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchaseId }/cancel`;

export const getDowngradeUrlFor = (
	targetSiteSlug: string,
	targetPurchaseId: string | number
): string => `/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchaseId }/downgrade`;

export const getPurchaseListUrlFor = ( targetSiteSlug: string | number ): string =>
	`/purchases/subscriptions/${ targetSiteSlug }`;

export const getAddPaymentMethodUrlFor = (
	targetSiteSlug: string,
	targetPurchaseId: string | number
): string =>
	`/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchaseId }/payment-method/add`;

export const getAddNewPaymentMethodUrlFor = ( targetSiteSlug: string ): string =>
	`/purchases/add-payment-method/${ targetSiteSlug }`;

export const getPaymentMethodsUrlFor = ( targetSiteSlug: string ): string =>
	`/purchases/payment-methods/${ targetSiteSlug }`;

export const getChangePaymentMethodUrlFor = (
	targetSiteSlug: string,
	targetPurchaseId: string | number,
	targetCardId: string | number
): string =>
	`/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchaseId }/payment-method/change/${ targetCardId }`;

export const getReceiptUrlFor = (
	targetSiteSlug: string,
	targetReceiptId: string | number
): string => `/purchases/billing-history/${ targetSiteSlug }/${ targetReceiptId }`;

export const getBillingHistoryUrlFor = ( targetSiteSlug: string ): string =>
	`/purchases/billing-history/${ targetSiteSlug }`;

export const getCrmDownloadsUrlFor = (
	targetSiteSlug: string,
	targetPurchaseId: string | number
): string => `/purchases/crm-downloads/${ targetSiteSlug }/${ targetPurchaseId }`;
