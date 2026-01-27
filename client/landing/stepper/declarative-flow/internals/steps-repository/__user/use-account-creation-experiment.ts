import { isOnboardingFlow } from '@automattic/onboarding';
import { useExperiment } from 'calypso/lib/explat';

type AccountCreationExperimentVariant =
	| 'control'
	| 'treatment_email'
	| 'treatment_email_messaging' // this was repurposed as a slider variation
	| 'treatment_email_messaging_slider' // this slider will not show the description text
	| 'treatment_email_slider'
	| 'treatment_messaging_slider';

type AccountCreationExperimentResult = {
	isLoading: boolean;
	variationName: AccountCreationExperimentVariant;
	isEmailVariation: boolean;
	isMessagingVariation: boolean;
	isSliderVariation: boolean;
	isSimpleSliderVariation: boolean;
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
	'treatment_email_slider',
	'treatment_messaging_slider',
	'treatment_email_messaging_slider',
	'treatment_email_messaging', // this was repurposed as a slider variation
];

const SIMPLE_SLIDER_VARIATIONS: AccountCreationExperimentVariant[] = [
	'treatment_email_messaging_slider', // this slider will have less text than the other
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
		isSimpleSliderVariation: SIMPLE_SLIDER_VARIATIONS.includes( variationName ),
	};
}

export default useAccountCreationExperiment;
export type { AccountCreationExperimentVariant, AccountCreationExperimentResult };
