import { DotcomFeatures, DotcomPlans } from '../data/constants';
import type { Site } from '../data/types';

export function hasPlanFeature( site: Site, feature: DotcomFeatures ) {
	if ( ! site.plan ) {
		return false;
	}

	return site.plan.features.active.includes( feature );
}

export function hasHostingFeatures( site: Site ) {
	return site.is_wpcom_atomic && ! site.plan?.expired;
}

export function hasAdvancedHostingFeatures( site: Site ) {
	return hasHostingFeatures( site ) && hasPlanFeature( site, DotcomFeatures.SFTP );
}

export const isBigSkyTrial = ( site: Site ) => {
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
