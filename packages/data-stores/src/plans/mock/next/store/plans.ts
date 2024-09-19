import type { SitePlan, PlanNext } from '../../../types';

/**
 * Site Plans
 */

export const NEXT_STORE_SITE_PLAN_PERSONAL: SitePlan = {
	planSlug: 'personal-bundle',
	productSlug: 'personal-bundle',
	productId: 1,
	pricing: {
		currencyCode: 'USD',
		introOffer: null,
		originalPrice: {
			monthly: 400,
			full: 4800,
		},
		discountedPrice: {
			monthly: null,
			full: null,
		},
	},
};

export const NEXT_STORE_SITE_PLAN_BUSINESS: SitePlan = {
	planSlug: 'business-bundle',
	productSlug: 'business-bundle',
	productId: 2,
	pricing: {
		introOffer: {
			formattedPrice: '$15.00',
			rawPrice: 15,
			intervalUnit: 'month',
			intervalCount: 1,
			isOfferComplete: false,
		},
		originalPrice: {
			monthly: 2500,
			full: 30000,
		},
		discountedPrice: {
			monthly: null,
			full: null,
		},
		currencyCode: 'USD',
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
	pricing: {
		billPeriod: 365,
		currencyCode: 'USD',
		introOffer: null,
		originalPrice: {
			monthly: 400,
			full: 4800,
		},
		discountedPrice: {
			monthly: null,
			full: null,
		},
	},
};

export const NEXT_STORE_PLAN_BUSINESS: PlanNext = {
	planSlug: 'business-bundle',
	productSlug: 'business-bundle',
	productId: 2,
	productNameShort: 'Business',
	pricing: {
		billPeriod: 365,
		currencyCode: 'USD',
		introOffer: {
			formattedPrice: '$25.00',
			rawPrice: 25,
			intervalUnit: 'month',
			intervalCount: 1,
			isOfferComplete: false,
		},
		originalPrice: {
			monthly: 2500,
			full: 30000,
		},
		discountedPrice: {
			monthly: null,
			full: null,
		},
	},
};
