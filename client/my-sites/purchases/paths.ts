export const getManagePurchaseUrlFor = (
	targetSiteSlug: string,
	targetPurchaseId: string | number
): string => `/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchaseId }`;

export const getMyPurchaseUrlFor = (
	targetSiteSlug: string,
	targetPurchaseId: string | number
): string => `/me/purchases/${ targetSiteSlug }/${ targetPurchaseId }`;

export const getCancelPurchaseUrlFor = (
	targetSiteSlug: string,
	targetPurchaseId: string | number
): string => `/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchaseId }/cancel`;

export const getPurchaseListUrlFor = ( targetSiteSlug: string | number ): string =>
	`/purchases/subscriptions/${ targetSiteSlug }`;

export const getAddNewPaymentMethodUrlFor = ( targetSiteSlug: string ): string =>
	`/purchases/add-payment-method/${ targetSiteSlug }`;
