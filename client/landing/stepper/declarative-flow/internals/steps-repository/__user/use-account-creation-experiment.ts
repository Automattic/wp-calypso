import { isOnboardingFlow } from '@automattic/onboarding';
import { useExperiment } from 'calypso/lib/explat';

type AccountCreationExperimentVariant =
	| 'control'
	| 'treatment_email'
	| 'treatment_email_messaging'
	| 'treatment_email_messaging_slider'
	| 'treatment_email_slider'
	| 'treatment_messaging_slider';

type AccountCreationExperimentResult = {
	isLoading: boolean;
	variationName: AccountCreationExperimentVariant;
	isEmailVariation: boolean;
	isMessagingVariation: boolean;
	isSliderVariation: boolean;
	isExperimentVariant: boolean;
};

interface UseAccountCreationExperimentParams {
	flow: string;
}

const EMAIL_VARIATIONS: AccountCreationExperimentVariant[] = [
	'treatment_email',
	'treatment_email_messaging',
	'treatment_email_messaging_slider',
	'treatment_email_slider',
];

const MESSAGING_VARIATIONS: AccountCreationExperimentVariant[] = [
	'treatment_email_messaging',
	'treatment_email_messaging_slider',
	'treatment_messaging_slider',
];

const SLIDER_VARIATIONS: AccountCreationExperimentVariant[] = [
	'treatment_email_messaging_slider',
	'treatment_email_slider',
	'treatment_messaging_slider',
];

function useAccountCreationExperiment( {
	flow,
}: UseAccountCreationExperimentParams ): AccountCreationExperimentResult {
	const [ isLoading, assignment ] = useExperiment( 'calypso_account_step_improvement_202601', {
		isEligible: isOnboardingFlow( flow ),
	} );

	const variationName = (
		isLoading ? 'control' : assignment?.variationName ?? 'control'
	) as AccountCreationExperimentVariant;

	return {
		isLoading,
		variationName,
		isEmailVariation: EMAIL_VARIATIONS.includes( variationName ),
		isMessagingVariation: MESSAGING_VARIATIONS.includes( variationName ),
		isSliderVariation: SLIDER_VARIATIONS.includes( variationName ),
		isExperimentVariant: variationName !== 'control',
	};
}

export default useAccountCreationExperiment;
export type { AccountCreationExperimentVariant, AccountCreationExperimentResult };
