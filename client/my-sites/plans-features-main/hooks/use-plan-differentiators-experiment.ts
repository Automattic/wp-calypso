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
	isInSignup: boolean;
	siteId?: number | null;
}

function usePlanDifferentiatorsExperiment(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	params: UsePlanDifferentiatorsParams
): PlanDifferentiatorsResult {
	const isEligible = true;

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
