import { registerStore } from '@wordpress/data';
import { controls } from '../wpcom-request-controls';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as resolvers from './resolvers';
import * as selectors from './selectors';

/** Types */
export type { State };
export type {
	Plan,
	SitePlan,
	PlanSlug,
	StorePlanSlug,
	PlanProduct,
	PlanFeature,
	PlanPath,
	PlanBillingPeriod,
	PlanSimplifiedFeature,
	PlanPricing,
	PricingMetaForGridPlan,
} from './types';
export type { UseCheckPlanAvailabilityForPurchase } from './hooks/use-pricing-meta-for-grid-plans';

/** Queries */
export { default as usePlans } from './queries/use-plans';
export { default as useSitePlans } from './queries/use-site-plans';
/** Hooks/Selectors */
export { default as useCurrentPlan } from './hooks/use-current-plan';
export { default as useIntroOffers } from './hooks/use-intro-offers';
export { default as useIntroOffersForWooExpress } from './hooks/use-intro-offers-for-woo-express';
export { default as usePricingMetaForGridPlans } from './hooks/use-pricing-meta-for-grid-plans';
export { default as useCurrentPlanExpiryDate } from './hooks/use-current-plan-expiry-date';

// plansSlugs is a list with the identifiers for each plan and they are agnostic of billing period; eg: 'free', 'personal'
// plansSlugs is also used to construct the route that accepts plan slugs like '/free', '/personal', '/business'
// plansProductSlugs is a list with the identifiers for each plan product (including the billing period); eg: 'personal-bundle', 'personal-bundle-monthly'
// TIMELESS_* is the slug for each plan
export {
	plansSlugs,
	plansProductSlugs,
	TIMELESS_PLAN_FREE,
	TIMELESS_PLAN_PERSONAL,
	TIMELESS_PLAN_PREMIUM,
	TIMELESS_PLAN_BUSINESS,
	TIMELESS_PLAN_ECOMMERCE,
	FREE_PLAN_PRODUCT_ID,
} from './constants';

let isRegistered = false;

export function register(): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore( STORE_KEY, {
			resolvers,
			actions,
			controls,
			reducer,
			selectors,
		} );
	}
	return STORE_KEY;
}
