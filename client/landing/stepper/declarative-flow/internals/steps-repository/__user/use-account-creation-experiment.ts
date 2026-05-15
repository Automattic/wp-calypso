import { isOnboardingFlow } from '@automattic/onboarding';
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

	// Woo-referrer users already see a permanent email-first + slider treatment from PR #110118.
	// Excluding them here keeps their behaviour stable and prevents skewed attribution.
	const [ isLoading, assignment ] = useExperiment( 'calypso_account_step_improvement_202605', {
		isEligible: isOnboardingFlow( flow ) && ! isWooReferrer,
	} );

	// Default to control while assignment is loading so the step renders immediately.
	// Round 1 blocked render on assignment and cost ~300 ms of LCP — avoid that here.
	const variationName = (
		isLoading ? 'control' : assignment?.variationName ?? 'control'
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
