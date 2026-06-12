import { useSelector } from 'calypso/state';
import getSite from 'calypso/state/sites/selectors/get-site';
import type { IAppState } from 'calypso/state/types';

type PlanDifferentiatorsResult = {
	/**
	 * When true, show the differentiator header (3 bullet points). Currently disabled.
	 */
	showDifferentiatorHeader: boolean;
	/**
	 * When true, use the no-AI wording feature set (getVar42NoAiSignupWpcomFeatures).
	 */
	useVar42NoAiFeatures: boolean;
	/**
	 * When true, show plan-scoped feature pills in the features grid.
	 * AI-labeled pills are suppressed (no-AI wording).
	 */
	showPricingDifferentiationFeaturePills: boolean;
	/**
	 * When true, use focused_new_copy taglines for plan headers.
	 */
	useFocusedNewCopyTaglines: boolean;
	/**
	 * When true, the user is in the rolled-out pricing differentiation cohort.
	 */
	isExperimentVariant: boolean;
};

interface UsePlanDifferentiatorsParams {
	flowName?: string | null;
	isInSignup: boolean;
	siteId?: number | null;
}

function usePlanDifferentiatorsExperiment( {
	flowName,
	isInSignup,
	siteId,
}: UsePlanDifferentiatorsParams ): PlanDifferentiatorsResult {
	const site = useSelector( ( state: IAppState ) => getSite( state, siteId ) );

	const hasGatingFlag = !! site?.options?.is_gating_business_q1;

	const isEligibleSignupFlow = isInSignup && flowName === 'onboarding';
	const isEligibleAdminIntent = ! isInSignup && hasGatingFlag;
	const isEligible =
		process.env.NODE_ENV !== 'test' && ( isEligibleSignupFlow || isEligibleAdminIntent );

	return {
		showDifferentiatorHeader: false,
		useVar42NoAiFeatures: isEligible,
		showPricingDifferentiationFeaturePills: isEligible,
		useFocusedNewCopyTaglines: isEligible,
		isExperimentVariant: isEligible,
	};
}

export default usePlanDifferentiatorsExperiment;
export type { PlanDifferentiatorsResult };
