import { useExperiment } from 'calypso/lib/explat';

type PlanDifferentiatorsExperimentVariant =
	| 'long_set'
	| 'long_set_diff'
	| 'long_set_stacked'
	| 'short_set_stacked'
	| 'short_set_stacked_diff';

type PlanDifferentiatorsExperimentResult = {
	isLoading: boolean;
	variant?: PlanDifferentiatorsExperimentVariant;
	/**
	 * When true, show "Everything in X, plus:" with incremental features.
	 * Applies to: long_set_stacked, short_set_stacked, short_set_stacked_diff
	 */
	isStacked: boolean;
	/**
	 * When true, use the long/full feature set instead of simplified.
	 * Applies to: long_set, long_set_diff, long_set_stacked
	 */
	isLongSet: boolean;
	/**
	 * When true, use the short/simplified feature set instead of simplified.
	 * Applies to: short_set_stacked, short_set_stacked_diff
	 */
	isShortSet: boolean;
	/**
	 * When true, show the differentiator header (3 bullet points).
	 * Applies to: long_set_diff, short_set_stacked_diff
	 */
	showDifferentiatorHeader: boolean;
};

interface UsePlanDifferentiatorsExperimentParams {
	flowName?: string | null;
	intent?: string;
	isInSignup: boolean;
}

function usePlanDifferentiatorsExperiment( {
	flowName,
	intent,
	isInSignup,
}: UsePlanDifferentiatorsExperimentParams ): PlanDifferentiatorsExperimentResult {
	// Eligible for onboarding signup flow or plans-default-wpcom admin intent
	const isEligibleSignupFlow = isInSignup && flowName === 'onboarding';
	const isEligibleAdminIntent = ! isInSignup && intent === 'plans-default-wpcom';
	const isEligible =
		process.env.NODE_ENV !== 'test' && ( isEligibleSignupFlow || isEligibleAdminIntent );

	const [ isLoading, assignment ] = useExperiment( 'calypso_plans_differentiators_20251210', {
		isEligible,
	} );

	const variant = ( assignment?.variationName ?? undefined ) as
		| PlanDifferentiatorsExperimentVariant
		| undefined;

	return {
		isLoading,
		variant,
		isStacked: variant?.includes( 'stacked' ) ?? false,
		isLongSet: variant?.includes( 'long_set' ) ?? false,
		isShortSet: variant?.includes( 'short_set' ) ?? false,
		showDifferentiatorHeader: variant?.includes( 'diff' ) ?? false,
	};
}

export default usePlanDifferentiatorsExperiment;
export type { PlanDifferentiatorsExperimentVariant, PlanDifferentiatorsExperimentResult };
