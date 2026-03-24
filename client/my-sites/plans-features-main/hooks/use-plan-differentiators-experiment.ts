import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import getSite from 'calypso/state/sites/selectors/get-site';
import type { IAppState } from 'calypso/state/types';

type PlanDifferentiatorsExperimentVariant =
	| 'control'
	| 'focused_comparison'
	| 'focused_more_premium'
	| 'focused_no_ai'
	| 'focused_new_copy';

type PlanDifferentiatorsExperimentResult = {
	isLoading: boolean;
	variant?: PlanDifferentiatorsExperimentVariant;
	/**
	 * When true, show the differentiator header (3 bullet points).
	 * Currently disabled for all variants.
	 */
	showDifferentiatorHeader: boolean;
	/**
	 * When true, use long-set feature list (getLongSetSignupWpcomFeatures).
	 * Applies to ExPlat variation: focused_comparison
	 */
	useVar4Features: boolean;
	/**
	 * When true, use more-premium / new-copy feature set (getVar41MorePremiumSignupWpcomFeatures).
	 * Applies to: focused_more_premium, focused_new_copy
	 */
	useVar41MorePremiumFeatures: boolean;
	/**
	 * When true, show plan-scoped feature pills (badges) in the features grid.
	 * Applies to: focused_more_premium, focused_new_copy, focused_no_ai (not control or focused_comparison).
	 * focused_no_ai omits AI-labeled pills only; Free / New / Email pills still apply.
	 */
	showPricingDifferentiationFeaturePills: boolean;
	/**
	 * When true, use no-AI wording feature set (getVar42NoAiSignupWpcomFeatures).
	 * Applies to: focused_no_ai
	 */
	useVar42NoAiFeatures: boolean;
	/**
	 * When true, the user is in any focused pricing experiment variant (not control).
	 * Used to exclude these variants from certain experiment-specific styling.
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

	const isVar4Variant =
		variant === 'focused_comparison' ||
		variant === 'focused_more_premium' ||
		variant === 'focused_no_ai' ||
		variant === 'focused_new_copy';

	return {
		isLoading,
		variant,
		showDifferentiatorHeader: false,
		useVar4Features: variant === 'focused_comparison',
		useVar41MorePremiumFeatures:
			variant === 'focused_more_premium' || variant === 'focused_new_copy',
		useVar42NoAiFeatures: variant === 'focused_no_ai',
		showPricingDifferentiationFeaturePills:
			variant === 'focused_more_premium' ||
			variant === 'focused_new_copy' ||
			variant === 'focused_no_ai',
		isVar4Variant,
		isExperimentVariant,
	};
}

export default usePlanDifferentiatorsExperiment;
export type { PlanDifferentiatorsExperimentVariant, PlanDifferentiatorsExperimentResult };
