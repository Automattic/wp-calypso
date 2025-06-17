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
	return ! [ DotcomPlans.JETPACK_FREE, DotcomPlans.FREE_PLAN ].includes(
		site.plan?.product_slug as DotcomPlans
	);
};

export const isSitePlanHostingTrial = ( site: Site ) => {
	return site.plan?.product_slug === DotcomPlans.HOSTING_TRIAL_MONTHLY;
};

export const isSiteOnECommerceTrial = ( site: Site ) => {
	return site.plan?.product_slug === DotcomPlans.ECOMMERCE_TRIAL_MONTHLY;
};

export const isSiteOnMigrationTrial = ( site: Site ) => {
	return site.plan?.product_slug === DotcomPlans.MIGRATION_TRIAL_MONTHLY;
};

export const isSiteLaunchable = ( site: Site ) => {
	return ! isSiteOnECommerceTrial( site ) && ! isSiteOnMigrationTrial( site );
};
