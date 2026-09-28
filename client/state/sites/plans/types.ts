/**
 * The camelCase site plan that `createSitePlanObject` assembles from the
 * `/sites/$site/plans` payload, as it is stored in `state.sites.plans` and
 * returned by `getCurrentPlan` and the other `state/sites/plans` selectors.
 *
 * Not to be confused with the purchase behind the plan: that is the raw
 * snake_case `Purchase` from `@automattic/api-core`.
 */
export interface SitePlanData {
	autoRenew?: boolean;
	autoRenewDate?: string;
	availableForDowngrade?: boolean;
	availableForUpgrade?: boolean;
	currencyCode: string;
	currentPlan?: boolean;
	expired?: boolean;
	expiry?: string;
	expiryDate?: string;
	freeTrial?: boolean;
	hasDomainCredit?: boolean;
	hasRedeemedDomainCredit?: boolean;
	id: number;
	interval: number;
	productName: string;
	productSlug: string;
	rawDiscount: string;
	rawDiscountInteger: number;
	rawPrice: number;
	rawPriceInteger: number;
	subscribedDate?: string;
	userIsOwner?: boolean;
}
