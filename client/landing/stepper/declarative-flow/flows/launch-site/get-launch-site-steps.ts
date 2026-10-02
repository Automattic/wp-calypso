import {
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_HOSTING_TRIAL_MONTHLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_PERSONAL_TRIAL_MONTHLY,
	PLAN_WOO_HOSTED_FREE_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import { STEPS } from '../../internals/steps';

// A free trial has a non-free product, so it reads as paid. Keep the plan step so trial sites can
// still buy the underlying plan on launch.
const FREE_TRIAL_PLAN_SLUGS: string[] = [
	PLAN_PERSONAL_TRIAL_MONTHLY,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_HOSTING_TRIAL_MONTHLY,
	PLAN_WOO_HOSTED_FREE_TRIAL_MONTHLY,
];

interface LaunchSite {
	plan?: { product_slug: string; is_free: boolean };
}

export function getLaunchSiteSteps(
	site: LaunchSite | null | undefined,
	domains: { wpcom_domain: boolean }[] | null | undefined
) {
	const hasCustomDomain = ( domains ?? [] ).some( ( domain ) => ! domain.wpcom_domain );
	const isPaidPlan = !! site?.plan && ! site.plan.is_free;
	const isFreeTrial = FREE_TRIAL_PLAN_SLUGS.includes( site?.plan?.product_slug ?? '' );

	return [
		...( hasCustomDomain ? [] : [ STEPS.DOMAIN_SEARCH, STEPS.USE_MY_DOMAIN ] ),
		...( isPaidPlan && ! isFreeTrial ? [] : [ STEPS.UNIFIED_PLANS ] ),
		STEPS.LAUNCH_SITE,
	];
}
