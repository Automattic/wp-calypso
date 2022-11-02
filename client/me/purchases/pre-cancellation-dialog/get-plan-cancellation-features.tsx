import { getPlan, isMonthly } from '@automattic/calypso-products';

export default function getPlanFeatures(
	productSlug: string | undefined,
	hasDomain: boolean
): string[] {
	if ( ! productSlug ) {
		return [];
	}

	const isMonthlyPlan = isMonthly( productSlug );

	const plan = getPlan( productSlug );
	if ( ! plan || ! plan.getCancellationFeatureList ) {
		return [];
	}

	const featureList = plan.getCancellationFeatureList();

	/**
	 * Return plan + domain cancellation flow feature list
	 */
	if ( hasDomain === true && featureList.withDomain ) {
		return featureList.withDomain;
	}

	/**
	 * Return monthly or yearly cancellation flow feature list
	 */
	// Monthly plan
	if ( isMonthlyPlan && featureList.monthly ) {
		return featureList.monthly;
	}

	// Yearly plan
	if ( ! isMonthlyPlan && featureList.yearly ) {
		return featureList.yearly;
	}

	return [];
}
