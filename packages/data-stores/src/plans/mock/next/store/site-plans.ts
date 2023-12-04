import type { SitePlan } from '../../../types';

export const NEXT_STORE_SITE_PLAN_FREE: SitePlan = {
	planSlug: 'free_plan',
	productSlug: 'free_plan',
	productId: 1,
};

export const NEXT_STORE_SITE_PLAN_BUSINESS: SitePlan = {
	planSlug: 'business-bundle',
	productSlug: 'business-bundle',
	productId: 2,
};

export const NEXT_STORE_SITE_PLAN_BUSINESS_CURRENT: SitePlan = {
	...NEXT_STORE_SITE_PLAN_BUSINESS,
	currentPlan: true,
};
