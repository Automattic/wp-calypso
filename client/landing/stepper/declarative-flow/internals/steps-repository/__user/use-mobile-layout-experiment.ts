import { useViewportMatch } from '@wordpress/compose';
import { WOO_HOSTING_SOLUTIONS_REF } from 'calypso/landing/stepper/constants';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useExperiment } from 'calypso/lib/explat';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';

// Register the variation names below in ExPlat alongside the experiment slug.
const MOBILE_LAYOUT_EXPERIMENT_NAME = 'calypso_signup_onboarding_user_mobile_layout_202605';

type MobileLayoutExperimentVariant = 'control' | 'treatment_tos_bottom' | 'treatment_tos_top';

type MobileLayoutExperimentResult = {
	isLoading: boolean;
	variationName: MobileLayoutExperimentVariant;
	// True for both treatments — both apply the compact mobile layout. The two
	// treatments differ only in ToS placement (see isMobileTreatmentTosTop).
	isMobileTreatment: boolean;
	// True for the top-position arm only — ToS rendered below the subtitle,
	// with "options below" copy, and the form's internal ToS is suppressed.
	isMobileTreatmentTosTop: boolean;
	isEligible: boolean;
};

interface UseMobileLayoutExperimentParams {
	flow: string;
	// True when usePartnerBranding resolves a partnerConfig (Woo-branded OAuth2
	// client, from=woo, redirect_to hostname match, etc.). Broader than the
	// isWooReferrer ref-param check, so it must be passed in explicitly.
	isPartnerFlow: boolean;
}

// The mobile-layout experiment is only eligible on mobile viewports so desktop
// users never consume an ExPlat slot. Woo-referrer users keep their permanent
// email-first treatment from PR #110118 and are excluded. Partner-branded flows
// are also excluded so the treatment never overrides their SSO providers, ToS,
// or heading copy — partner branding always wins (see index.tsx).
function useMobileLayoutExperiment( {
	flow,
	isPartnerFlow,
}: UseMobileLayoutExperimentParams ): MobileLayoutExperimentResult {
	const queryArgs = useQuery();
	const isWooReferrer = queryArgs.get( 'ref' ) === WOO_HOSTING_SOLUTIONS_REF;
	const isStepContainerV2 = shouldUseStepContainerV2( flow );
	const isMobileViewport = useViewportMatch( 'small', '<' );

	const isEligible = isStepContainerV2 && isMobileViewport && ! isWooReferrer && ! isPartnerFlow;
	const [ isLoading, assignment ] = useExperiment( MOBILE_LAYOUT_EXPERIMENT_NAME, {
		isEligible,
	} );

	// Default to control while loading or for ineligible users — but consumers
	// should also branch on isLoading to decide whether to defer the reveal,
	// because allowing control-shape UI to paint before assignment resolves
	// would self-bias the social-conversion metric this experiment measures.
	const variationName: MobileLayoutExperimentVariant =
		! isEligible || isLoading
			? 'control'
			: ( assignment?.variationName as MobileLayoutExperimentVariant | undefined ) ?? 'control';

	const isMobileTreatment =
		variationName === 'treatment_tos_bottom' || variationName === 'treatment_tos_top';
	const isMobileTreatmentTosTop = variationName === 'treatment_tos_top';

	return {
		isLoading,
		variationName,
		isMobileTreatment,
		isMobileTreatmentTosTop,
		isEligible,
	};
}

export default useMobileLayoutExperiment;
export type { MobileLayoutExperimentVariant, MobileLayoutExperimentResult };
