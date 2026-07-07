import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import getSite from 'calypso/state/sites/selectors/get-site';
import type { IAppState } from 'calypso/state/types';

const PLANS_GRID_REDESIGN_EXPERIMENT_NAME = 'calypso_pricing_differentiation_202607';

const PLANS_GRID_REDESIGN_EXPERIMENT_VARIANTS = [
	'control',
	'five_plan_new_description',
	'four_plan_new_description',
	'six_plan_new_description',
	'six_plan_new_design',
	'six_plan_new_features',
] as const;

type PlansGridRedesignExperimentVariant =
	( typeof PLANS_GRID_REDESIGN_EXPERIMENT_VARIANTS )[ number ];

type PlansGridRedesignExperimentResult = {
	isLoading: boolean;
	variant: PlansGridRedesignExperimentVariant;
	/**
	 * When true, apply the redesigned pricing grid.
	 */
	usePlansGridRedesign: boolean;
	/**
	 * When true, use the redesigned plan tagline copy.
	 */
	usePlansGridRedesignNewDescription: boolean;
	/**
	 * When true, show the differentiator header (4 bullet points).
	 */
	showDifferentiatorHeader: boolean;
	/**
	 * When true, show the Enterprise/VIP card at the bottom.
	 */
	showEnterpriseBottomCard: boolean;
	/**
	 * When true, show the WooCommerce card at the bottom.
	 */
	showWooCommerceBottomCard: boolean;
	/**
	 * When true, the user is eligible for the experiment (any arm, including control).
	 */
	isExperimentEligible: boolean;
};

interface UsePlansGridRedesignExperimentParams {
	flowName?: string | null;
	isInSignup: boolean;
	siteId?: number | null;
}

function isPlansGridRedesignExperimentVariant(
	variationName?: string | null
): variationName is PlansGridRedesignExperimentVariant {
	return PLANS_GRID_REDESIGN_EXPERIMENT_VARIANTS.includes(
		variationName as PlansGridRedesignExperimentVariant
	);
}

function usePlansGridRedesignExperiment( {
	flowName,
	isInSignup,
	siteId,
}: UsePlansGridRedesignExperimentParams ): PlansGridRedesignExperimentResult {
	const site = useSelector( ( state: IAppState ) => getSite( state, siteId ) );

	const hasGatingFlag = !! site?.options?.is_gating_business_q1;
	const wasCreatedWithOnboardingFlow = site?.options?.site_creation_flow === 'onboarding';

	// New-site onboarding signups are eligible before a site exists.
	// Existing sites are eligible only when they were created by onboarding and have the gating flag.
	const isEligibleSignupFlow = isInSignup && flowName === 'onboarding';
	const isEligible =
		( isEligibleSignupFlow && ! siteId ) || ( hasGatingFlag && wasCreatedWithOnboardingFlow );

	const [ isLoading, assignment ] = useExperiment( PLANS_GRID_REDESIGN_EXPERIMENT_NAME, {
		isEligible,
	} );

	const rawVariationName = assignment?.variationName;

	const variant: PlansGridRedesignExperimentVariant =
		isEligible && ! isLoading && isPlansGridRedesignExperimentVariant( rawVariationName )
			? rawVariationName
			: 'control';

	const usePlansGridRedesign = isEligible && ! isLoading && variant !== 'control';
	const usePlansGridRedesignNewDescription =
		usePlansGridRedesign &&
		[
			'five_plan_new_description',
			'four_plan_new_description',
			'six_plan_new_description',
		].includes( variant );

	return {
		isLoading,
		variant,
		usePlansGridRedesign,
		usePlansGridRedesignNewDescription,
		showDifferentiatorHeader: usePlansGridRedesign && variant === 'six_plan_new_features',
		showEnterpriseBottomCard: usePlansGridRedesign && variant === 'five_plan_new_description',
		showWooCommerceBottomCard: usePlansGridRedesign && variant === 'four_plan_new_description',
		isExperimentEligible: isEligible,
	};
}

export default usePlansGridRedesignExperiment;
export type { PlansGridRedesignExperimentResult, PlansGridRedesignExperimentVariant };
