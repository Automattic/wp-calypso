import type { SitePlan, PlanNext } from '../../../types';

/**
 * Site Plans
 */

export const NEXT_STORE_SITE_PLAN_PERSONAL: SitePlan = {
	planSlug: 'personal-bundle',
	productSlug: 'personal-bundle',
	productId: 1,
};

export const NEXT_STORE_SITE_PLAN_BUSINESS: SitePlan = {
	planSlug: 'business-bundle',
	productSlug: 'business-bundle',
	productId: 2,
	introOffer: {
		formattedPrice: '$15.00',
		rawPrice: 15,
		intervalUnit: 'month',
		intervalCount: 1,
		isOfferComplete: false,
	},
};

export const NEXT_STORE_SITE_PLAN_BUSINESS_CURRENT: SitePlan = {
	...NEXT_STORE_SITE_PLAN_BUSINESS,
	currentPlan: true,
};

/**
 * Plans
 */

export const NEXT_STORE_PLAN_PERSONAL: PlanNext = {
	planSlug: 'personal-bundle',
	productSlug: 'personal-bundle',
	productId: 1,
	productNameShort: 'Personal',
	billPeriod: -1,
	currencyCode: 'USD',
};

export const NEXT_STORE_PLAN_BUSINESS: PlanNext = {
	planSlug: 'business-bundle',
	productSlug: 'business-bundle',
	productId: 2,
	introOffer: {
		formattedPrice: '$25.00',
		rawPrice: 25,
		intervalUnit: 'month',
		intervalCount: 1,
		isOfferComplete: false,
	},
	productNameShort: 'Business',
	billPeriod: 365,
	currencyCode: 'USD',
};
