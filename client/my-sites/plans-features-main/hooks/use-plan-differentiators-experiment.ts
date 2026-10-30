import { hasTailoredFeatureList } from '@automattic/plans-grid-next';
import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import getSite from 'calypso/state/sites/selectors/get-site';
import type { PlansIntent } from '@automattic/plans-grid-next';
import type { IAppState } from 'calypso/state/types';

const PLAN_DIFFERENTIATORS_EXPERIMENT_NAME = 'calypso_pricing_differentiation_202611';
const PLAN_DIFFERENTIATORS_EXPERIMENT_LAUNCH_DATE = '2026-11-05 00:00:00';

const PLAN_DIFFERENTIATORS_EXPERIMENT_VARIANTS = [
	'control',
	'ai_credits',
	'ai_credits_reversed_order',
] as const;

type PlanDifferentiatorsExperimentVariant =
	( typeof PLAN_DIFFERENTIATORS_EXPERIMENT_VARIANTS )[ number ];

type PlanDifferentiatorsResult = {
	isLoading: boolean;
	variant: PlanDifferentiatorsExperimentVariant;
	/**
	 * When true, show each paid plan's monthly AI credits on the grid.
	 */
	showAiCredits: boolean;
	/**
	 * When true, list the plans most expensive first, with Enterprise kept in the last column.
	 * Not for intents that curate their own plan mix.
	 */
	useReversedPlanOrder: boolean;
	/**
	 * When true, the user is eligible for the experiment (including control).
	 */
	isExperimentEligible: boolean;
};

interface UsePlanDifferentiatorsParams {
	flowName?: string | null;
	intent?: PlansIntent | null;
	isInSignup: boolean;
	siteId?: number | null;
}

function isPlanDifferentiatorsExperimentVariant(
	variationName?: string | null
): variationName is PlanDifferentiatorsExperimentVariant {
	return PLAN_DIFFERENTIATORS_EXPERIMENT_VARIANTS.includes(
		variationName as PlanDifferentiatorsExperimentVariant
	);
}

function usePlanDifferentiatorsExperiment( {
	flowName,
	intent,
	isInSignup,
	siteId,
}: UsePlanDifferentiatorsParams ): PlanDifferentiatorsResult {
	const site = useSelector( ( state: IAppState ) => getSite( state, siteId ) );

	const wasCreatedWithOnboardingFlow = site?.options?.site_creation_flow === 'onboarding';
	const siteCreatedAt = site?.options?.created_at;
	const wasCreatedAfterExperimentLaunch =
		!! siteCreatedAt && siteCreatedAt > PLAN_DIFFERENTIATORS_EXPERIMENT_LAUNCH_DATE;

	// New-site onboarding signups are eligible before a site exists.
	// Existing sites are eligible only when they were created by onboarding after launch.
	const isEligibleSignupFlow = isInSignup && flowName === 'onboarding';
	const isEligible =
		( isEligibleSignupFlow && ! siteId ) ||
		( wasCreatedWithOnboardingFlow && wasCreatedAfterExperimentLaunch );

	const [ isLoading, assignment ] = useExperiment( PLAN_DIFFERENTIATORS_EXPERIMENT_NAME, {
		isEligible,
	} );

	const rawVariationName = assignment?.variationName;

	const variant: PlanDifferentiatorsExperimentVariant =
		isEligible && ! isLoading && isPlanDifferentiatorsExperimentVariant( rawVariationName )
			? rawVariationName
			: 'control';

	return {
		isLoading,
		variant,
		showAiCredits: variant === 'ai_credits' || variant === 'ai_credits_reversed_order',
		// Reversing assumes the standard lineup, which a curated intent (e.g. newsletter) replaces.
		useReversedPlanOrder:
			variant === 'ai_credits_reversed_order' && ! hasTailoredFeatureList( intent ),
		isExperimentEligible: isEligible,
	};
}

export default usePlanDifferentiatorsExperiment;
export type { PlanDifferentiatorsResult, PlanDifferentiatorsExperimentVariant };
