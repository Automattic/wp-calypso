import { isOnboardingFlow } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { WOO_HOSTING_SOLUTIONS_REF } from 'calypso/landing/stepper/constants';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useExperiment } from 'calypso/lib/explat';

type AccountCreationExperimentVariant =
	| 'control'
	| 'treatment_email_slider_webp'
	| 'treatment_email_bottom_slider_webp';

type AccountCreationExperimentResult = {
	isLoading: boolean;
	variationName: AccountCreationExperimentVariant;
	isEmailFirstVariant: boolean;
	isEmailAtBottom: boolean;
};

interface UseAccountCreationExperimentParams {
	flow: string;
}

const EMAIL_FIRST_VARIATIONS: AccountCreationExperimentVariant[] = [
	'treatment_email_slider_webp',
	'treatment_email_bottom_slider_webp',
];

function useAccountCreationExperiment( {
	flow,
}: UseAccountCreationExperimentParams ): AccountCreationExperimentResult {
	const queryArgs = useQuery();
	const isWooReferrer = queryArgs.get( 'ref' ) === WOO_HOSTING_SOLUTIONS_REF;
	// `large` matches the 960 px breakpoint we use for the two-column slider layout.
	const isLargeViewport = useViewportMatch( 'large' );

	// Excluded from the experiment:
	//   - Woo-referrer users (permanent treatment from PR #110118 — preserve their UX).
	//   - Sub-960 px viewports — mobile-web signup is owned by a separate team.
	const [ isLoading, assignment ] = useExperiment( 'calypso_account_step_improvement_202605_v2', {
		isEligible: isOnboardingFlow( flow ) && ! isWooReferrer && isLargeViewport,
	} );

	// Default to control while assignment is loading so the step renders immediately
	// (round 1 blocked render on assignment and cost ~300 ms of LCP — avoid that here),
	// and force control on sub-960 px viewports as a render-time guard against any
	// post-assignment viewport change.
	const variationName = (
		isLoading || ! isLargeViewport ? 'control' : assignment?.variationName ?? 'control'
	) as AccountCreationExperimentVariant;

	return {
		isLoading,
		variationName,
		isEmailFirstVariant: EMAIL_FIRST_VARIATIONS.includes( variationName ),
		isEmailAtBottom: variationName === 'treatment_email_bottom_slider_webp',
	};
}

export default useAccountCreationExperiment;
export type { AccountCreationExperimentVariant, AccountCreationExperimentResult };
