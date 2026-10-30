import { hasTailoredFeatureList } from '@automattic/plans-grid-next';
import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import getRawSite from 'calypso/state/selectors/get-raw-site';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';
import type { PlansIntent } from '@automattic/plans-grid-next';
import type { IAppState } from 'calypso/state/types';

const PLAN_DIFFERENTIATORS_EXPERIMENT_NAME = 'calypso_pricing_differentiation_202611';
const PLAN_DIFFERENTIATORS_EXPERIMENT_LAUNCH_DATE = '2026-11-05T00:00:00Z';

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
	const hasSite = useSelector( ( state: IAppState ) => !! getRawSite( state, siteId ) );
	const siteCreationFlow = useSelector( ( state: IAppState ) =>
		getSiteOption( state, siteId, 'site_creation_flow' )
	);
	const siteCreatedAt = useSelector( ( state: IAppState ) =>
		getSiteOption( state, siteId, 'created_at' )
	);
	// Eligibility depends on the site's options, so report loading until the site arrives
	// rather than briefly reporting control.
	const isSiteLoading = !! siteId && ! hasSite;

	const wasCreatedWithOnboardingFlow = siteCreationFlow === 'onboarding';
	const wasCreatedAfterExperimentLaunch =
		typeof siteCreatedAt === 'string' &&
		Date.parse( siteCreatedAt ) > Date.parse( PLAN_DIFFERENTIATORS_EXPERIMENT_LAUNCH_DATE );

	const isEligibleSignupFlow = isInSignup && flowName === 'onboarding';
	const isEligible =
		( isEligibleSignupFlow && ! siteId ) ||
		( wasCreatedWithOnboardingFlow && wasCreatedAfterExperimentLaunch );

	const [ isExperimentLoading, assignment ] = useExperiment( PLAN_DIFFERENTIATORS_EXPERIMENT_NAME, {
		isEligible,
	} );
	const isLoading = isSiteLoading || isExperimentLoading;

	const rawVariationName = assignment?.variationName;

	const variant: PlanDifferentiatorsExperimentVariant = isPlanDifferentiatorsExperimentVariant(
		rawVariationName
	)
		? rawVariationName
		: 'control';

	return {
		isLoading,
		variant,
		showAiCredits: variant !== 'control',
		// Reversing assumes the standard lineup, which a curated intent (e.g. newsletter) replaces.
		useReversedPlanOrder:
			variant === 'ai_credits_reversed_order' && ! hasTailoredFeatureList( intent ),
		isExperimentEligible: isEligible,
	};
}

export default usePlanDifferentiatorsExperiment;
export type { PlanDifferentiatorsResult, PlanDifferentiatorsExperimentVariant };
