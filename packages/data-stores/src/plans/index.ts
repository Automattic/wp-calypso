import { registerStore } from '@wordpress/data';
import { controls } from '../wpcom-request-controls';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as resolvers from './resolvers';
import * as selectors from './selectors';

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
} from './types';

export { default as useSitePlans } from './queries/use-site-plans';
export { default as useIntroOffers } from './hooks/use-intro-offers';
export { default as useIntroOffersForWooExpress } from './hooks/use-intro-offers-for-woo-express';

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
