import { useExperiment } from 'calypso/lib/explat';

type PlanDifferentiatorsExperimentVariant = 'control' | 'var1' | 'var1d' | 'var3' | 'var4' | 'var5';

type PlanDifferentiatorsExperimentResult = {
	isLoading: boolean;
	variant?: PlanDifferentiatorsExperimentVariant;
	/**
	 * When true, show "Everything in X, plus:" with incremental features.
	 * Applies to: var1, var1d, var3, var5
	 */
	isStacked: boolean;
	/**
	 * When true, use the long/full feature set instead of simplified.
	 * Applies to: var3, var4
	 */
	isLongSet: boolean;
	/**
	 * When true, use the short/simplified feature set instead of simplified.
	 * Applies to: var1, var1d, var5
	 */
	isShortSet: boolean;
	/**
	 * When true, show the differentiator header (3 bullet points).
	 * Currently disabled for all variants.
	 */
	showDifferentiatorHeader: boolean;
	/**
	 * When true, use var5 feature set (getVar5StackedSignupWpcomFeatures).
	 * Applies to: var5
	 */
	useVar5Features: boolean;
	/**
	 * When true, use var4 feature set (getLongSetSignupWpcomFeatures).
	 * Applies to: var4
	 */
	useVar4Features: boolean;
	/**
	 * When true, use var3 feature set (getLongSetStackedSignupWpcomFeatures).
	 * Applies to: var3
	 */
	useVar3Features: boolean;
	/**
	 * When true, use var1/var1d feature set (getShortSetStackedSignupWpcomFeatures).
	 * Applies to: var1, var1d
	 */
	useVar1Features: boolean;
	/**
	 * When true, the user is specifically in the var1d variant.
	 * Used to apply differentiator styling to features below "Everything in X" headers.
	 */
	isVar1dVariant: boolean;
	/**
	 * When true, the user is in an experiment variant (not control).
	 */
	isExperimentVariant: boolean;
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

	const [ isLoading, assignment ] = useExperiment( 'calypso_plans_differentiators_20260117', {
		isEligible,
	} );

	const variant = ( assignment?.variationName ?? undefined ) as
		| PlanDifferentiatorsExperimentVariant
		| undefined;

	const isExperimentVariant = variant !== undefined && variant !== 'control';

	// Map variants to feature sets:
	// var4 -> getLongSetSignupWpcomFeatures
	// var1, var1d -> getShortSetStackedSignupWpcomFeatures
	// var3 -> getLongSetStackedSignupWpcomFeatures
	// var5 -> getVar5StackedSignupWpcomFeatures

	return {
		isLoading,
		variant,
		isStacked:
			variant === 'var1' || variant === 'var1d' || variant === 'var3' || variant === 'var5',
		isLongSet: variant === 'var3' || variant === 'var4',
		isShortSet: variant === 'var1' || variant === 'var1d' || variant === 'var5',
		showDifferentiatorHeader: false,
		useVar5Features: variant === 'var5',
		useVar4Features: variant === 'var4',
		useVar3Features: variant === 'var3',
		useVar1Features: variant === 'var1' || variant === 'var1d',
		isVar1dVariant: variant === 'var1d',
		isExperimentVariant,
	};
}

export default usePlanDifferentiatorsExperiment;
export type { PlanDifferentiatorsExperimentVariant, PlanDifferentiatorsExperimentResult };
