import { getPlan, isMonthly } from '@automattic/calypso-products';

export default function getPlanCancellationFeatures( productSlug, hasDomain ) {
	if ( ! productSlug ) {
		return {
			featureList: [],
			andMore: false,
		};
	}

	const isMonthlyPlan = isMonthly( productSlug );

	const plan = getPlan( productSlug );

	if ( ! plan || ! plan.getCancellationFeatureList ) {
		return {
			featureList: [],
			andMore: false,
		};
	}

	const cancellationFeatures = plan.getCancellationFeatureList();

	/**
	 * Return plan + domain cancellation flow feature list
	 */
	if ( hasDomain === true && cancellationFeatures.withDomain?.featureList ) {
		return {
			featureList: cancellationFeatures.withDomain.featureList,
			andMore: cancellationFeatures.withDomain.andMore,
		};
	}

	/**
	 * Return monthly or yearly cancellation flow feature list
	 */
	// Monthly plan
	if ( isMonthlyPlan && cancellationFeatures.monthly?.featureList ) {
		return {
			featureList: cancellationFeatures.monthly.featureList,
			andMore: cancellationFeatures.monthly.andMore,
		};
	}

	// Yearly plan
	if ( ! isMonthlyPlan && cancellationFeatures.yearly?.featureList ) {
		return {
			featureList: cancellationFeatures.yearly.featureList,
			andMore: cancellationFeatures.yearly.andMore,
		};
	}

	return {
		featureList: [],
		andMore: false,
	};
}
