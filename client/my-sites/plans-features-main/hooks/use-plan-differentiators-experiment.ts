import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import getSite from 'calypso/state/sites/selectors/get-site';
import type { IAppState } from 'calypso/state/types';

type PlanDifferentiatorsExperimentVariant =
	| 'control'
	| 'var4'
	| 'var4_1_more_premium'
	| 'var4_2_no_ai'
	| 'var4_3_new_copy';

type PlanDifferentiatorsExperimentResult = {
	isLoading: boolean;
	variant?: PlanDifferentiatorsExperimentVariant;
	/**
	 * When true, show the differentiator header (3 bullet points).
	 * Currently disabled for all variants.
	 */
	showDifferentiatorHeader: boolean;
	/**
	 * When true, use var4 feature set (getLongSetSignupWpcomFeatures).
	 * Applies to: var4, var4_3_new_copy
	 */
	useVar4Features: boolean;
	/**
	 * When true, use var4_1 feature set (getVar41MorePremiumSignupWpcomFeatures).
	 * Applies to: var4_1_more_premium
	 */
	useVar41MorePremiumFeatures: boolean;
	/**
	 * When true, use var4_2 feature set (getVar42NoAiSignupWpcomFeatures).
	 * Applies to: var4_2_no_ai
	 */
	useVar42NoAiFeatures: boolean;
	/**
	 * When true, the user is in any var4-based variant.
	 * Used to exclude var4-style variants from certain experiment-specific styling.
	 */
	isVar4Variant: boolean;
	/**
	 * When true, the user is in an experiment variant (not control).
	 */
	isExperimentVariant: boolean;
};

interface UsePlanDifferentiatorsExperimentParams {
	flowName?: string | null;
	isInSignup: boolean;
	siteId?: number | null;
}

function usePlanDifferentiatorsExperiment( {
	flowName,
	isInSignup,
	siteId,
}: UsePlanDifferentiatorsExperimentParams ): PlanDifferentiatorsExperimentResult {
	const site = useSelector( ( state: IAppState ) => getSite( state, siteId ) );

	const hasGatingFlag = !! site?.options?.is_gating_business_q1;

	// Eligible for onboarding signup flow or when site flag is set
	const isEligibleSignupFlow = isInSignup && flowName === 'onboarding';
	const isEligibleAdminIntent = ! isInSignup && hasGatingFlag;
	const isEligible =
		process.env.NODE_ENV !== 'test' && ( isEligibleSignupFlow || isEligibleAdminIntent );

	const [ isLoading, assignment ] = useExperiment( 'calypso_pricing_differentiation_202603', {
		isEligible,
	} );

	const variant = ( assignment?.variationName ?? undefined ) as
		| PlanDifferentiatorsExperimentVariant
		| undefined;

	const isExperimentVariant = variant !== undefined && variant !== 'control';

	return {
		isLoading,
		variant,
		showDifferentiatorHeader: false,
		useVar4Features: variant === 'var4' || variant === 'var4_3_new_copy',
		useVar41MorePremiumFeatures: variant === 'var4_1_more_premium',
		useVar42NoAiFeatures: variant === 'var4_2_no_ai',
		isVar4Variant:
			variant === 'var4' ||
			variant === 'var4_1_more_premium' ||
			variant === 'var4_2_no_ai' ||
			variant === 'var4_3_new_copy',
		isExperimentVariant,
	};
}

export default usePlanDifferentiatorsExperiment;
export type { PlanDifferentiatorsExperimentVariant, PlanDifferentiatorsExperimentResult };
