import { DotcomPlans } from '../data/constants';
import type { Site } from '../data/types';

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

	const bigSkyPlans = [
		DotcomPlans.BUSINESS,
		DotcomPlans.BUSINESS_MONTHLY,
		DotcomPlans.BUSINESS_2_YEARS,
		DotcomPlans.BUSINESS_3_YEARS,
		DotcomPlans.PREMIUM,
		DotcomPlans.PREMIUM_MONTHLY,
		DotcomPlans.PREMIUM_2_YEARS,
		DotcomPlans.PREMIUM_3_YEARS,
	];

	return ! bigSkyPlans.includes( product_slug as DotcomPlans );
};

export const isSitePlanPaid = ( site: Site ) => {
	if ( ! site.plan ) {
		return false;
	}

	return ! [ DotcomPlans.JETPACK_FREE, DotcomPlans.FREE_PLAN ].includes(
		site.plan.product_slug as DotcomPlans
	);
};

export const isSitePlanHostingTrial = ( site: Site ) => {
	if ( ! site.plan ) {
		return false;
	}

	return site.plan.product_slug === DotcomPlans.HOSTING_TRIAL_MONTHLY;
};
