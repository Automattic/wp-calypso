import { DotcomPlans } from '../data/constants';
import type { Site } from '../data/types';

export const isSitePlanNotOneOf = ( site: Site, plans: DotcomPlans[] ) => {
	if ( ! site.plan ) {
		return false;
	}

	return ! plans.includes( site.plan.product_slug as DotcomPlans );
};

export const isSitePlanBigSkyTrial = ( site: Site ) => {
	if ( ! site.plan ) {
		return false;
	}

	const { launch_status, options, plan } = site;
	if ( options?.site_creation_flow !== 'ai-site-builder' || launch_status !== 'unlaunched' ) {
		return false;
	}

	const { product_slug } = plan;
	if ( ! product_slug ) {
		return true;
	}

	return isSitePlanNotOneOf( site, [
		DotcomPlans.BUSINESS,
		DotcomPlans.BUSINESS_MONTHLY,
		DotcomPlans.BUSINESS_2_YEARS,
		DotcomPlans.BUSINESS_3_YEARS,
		DotcomPlans.PREMIUM,
		DotcomPlans.PREMIUM_MONTHLY,
		DotcomPlans.PREMIUM_2_YEARS,
		DotcomPlans.PREMIUM_3_YEARS,
	] );
};

export const isSitePlanPaid = ( site: Site ) => {
	return isSitePlanNotOneOf( site, [ DotcomPlans.JETPACK_FREE, DotcomPlans.FREE_PLAN ] );
};

export const isSitePlanLaunchable = ( site: Site ) => {
	return isSitePlanNotOneOf( site, [
		DotcomPlans.ECOMMERCE_TRIAL_MONTHLY,
		DotcomPlans.MIGRATION_TRIAL_MONTHLY,
	] );
};
