import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import getSite from 'calypso/state/sites/selectors/get-site';
import type { IAppState } from 'calypso/state/types';

type PlanDifferentiatorsExperimentVariant =
	| 'control'
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
	 * When true, use the long-set signup feature list (getLongSetSignupWpcomFeatures).
	 * Set for eligible users on the control arm (Explat may return variationName null or "control").
	 */
	useFocusedComparisonFeatures: boolean;
	/**
	 * When true, use more-premium / new-copy feature set (getVar41MorePremiumSignupWpcomFeatures).
	 * Applies to: focused_more_premium, focused_new_copy
	 */
	useVar41MorePremiumFeatures: boolean;
	/**
	 * When true, show plan-scoped feature pills (badges) in the features grid.
	 * Applies to: focused_more_premium, focused_new_copy, focused_no_ai (not control / long-list).
	 * focused_no_ai omits AI-labeled pills only; Free / New / Email pills still apply.
	 */
	showPricingDifferentiationFeaturePills: boolean;
	/**
	 * When true, use no-AI wording feature set (getVar42NoAiSignupWpcomFeatures).
	 * Applies to: focused_no_ai
	 */
	useVar42NoAiFeatures: boolean;
	/**
	 * When true, use focused_new_copy taglines for plan headers.
	 * Applies to: focused_new_copy only.
	 */
	useFocusedNewCopyTaglines: boolean;
	/**
	 * When true, the user is eligible for the experiment (any arm, including control).
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

	const rawVariationName = assignment?.variationName;

	let variant: PlanDifferentiatorsExperimentVariant | undefined;
	if ( ! isEligible ) {
		variant = undefined;
	} else if ( rawVariationName === null || rawVariationName === 'control' ) {
		variant = 'control';
	} else {
		variant = rawVariationName as Exclude< PlanDifferentiatorsExperimentVariant, 'control' >;
	}

	const isExperimentVariant = isEligible;

	return {
		isLoading,
		variant,
		showDifferentiatorHeader: false,
		useFocusedComparisonFeatures: isEligible && variant === 'control',
		useVar41MorePremiumFeatures:
			variant === 'focused_more_premium' || variant === 'focused_new_copy',
		useVar42NoAiFeatures: variant === 'focused_no_ai',
		showPricingDifferentiationFeaturePills:
			variant === 'focused_more_premium' ||
			variant === 'focused_new_copy' ||
			variant === 'focused_no_ai',
		useFocusedNewCopyTaglines: variant === 'focused_new_copy',
		isExperimentVariant,
	};
}

export default usePlanDifferentiatorsExperiment;
export type { PlanDifferentiatorsExperimentVariant, PlanDifferentiatorsExperimentResult };
