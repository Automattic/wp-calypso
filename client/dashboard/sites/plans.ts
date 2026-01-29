import {
	DotcomPlans,
	JetpackPlans,
	WooHostedPlans,
	type StorePlanSlug,
	type Site,
} from '@automattic/api-core';

export const isSitePlanNotOneOf = ( site: Site, plans: StorePlanSlug[] ) => {
	if ( ! site.plan ) {
		return false;
	}

	return ! ( plans as string[] ).includes( site.plan.product_slug );
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
	return isSitePlanNotOneOf( site, [
		JetpackPlans.PLAN_JETPACK_FREE,
		DotcomPlans.FREE_PLAN,
		WooHostedPlans.WOO_HOSTED_FREE_PLAN,
	] );
};

export const isSitePlanLaunchable = ( site: Site ) => {
	return isSitePlanNotOneOf( site, [
		DotcomPlans.ECOMMERCE_TRIAL_MONTHLY,
		DotcomPlans.MIGRATION_TRIAL_MONTHLY,
	] );
};

export function isSitePlanTrial( site: Pick< Site, 'plan' > ) {
	const trialPlans = [
		DotcomPlans.ECOMMERCE_TRIAL_MONTHLY,
		DotcomPlans.HOSTING_TRIAL_MONTHLY,
		DotcomPlans.MIGRATION_TRIAL_MONTHLY,
		WooHostedPlans.WOO_HOSTED_FREE_TRIAL_PLAN_MONTHLY,
	] as StorePlanSlug[];

	return trialPlans.includes( site.plan?.product_slug as StorePlanSlug );
}

export function isSitePlanWooHosted( site: Pick< Site, 'plan' > ) {
	const wooHostedPlans = Object.values( WooHostedPlans ) as StorePlanSlug[];
	return wooHostedPlans.includes( site.plan?.product_slug as StorePlanSlug );
}
