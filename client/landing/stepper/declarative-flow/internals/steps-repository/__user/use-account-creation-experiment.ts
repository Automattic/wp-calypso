import { WOO_HOSTING_SOLUTIONS_REF } from 'calypso/landing/stepper/constants';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';

type AccountCreationExperimentVariant =
	| 'control'
	| 'treatment_email'
	| 'treatment_email_messaging_slider'
	| 'treatment_email_messaging_slider_simplified'
	| 'treatment_email_slider'
	| 'treatment_messaging_slider';

type AccountCreationExperimentResult = {
	isLoading: boolean;
	variationName: AccountCreationExperimentVariant;
	isExperimentVariant: boolean;
	isEmailVariation: boolean;
	isMessagingVariation: boolean;
	isSliderVariation: boolean;
	isSimpleSliderVariation: boolean;
};

const EMAIL_VARIATIONS: AccountCreationExperimentVariant[] = [
	'treatment_email',
	'treatment_email_messaging_slider',
	'treatment_email_messaging_slider_simplified',
	'treatment_email_slider',
];

const MESSAGING_VARIATIONS: AccountCreationExperimentVariant[] = [
	'treatment_email_messaging_slider',
	'treatment_email_messaging_slider_simplified',
	'treatment_messaging_slider',
];

const SLIDER_VARIATIONS: AccountCreationExperimentVariant[] = [
	'treatment_email_slider',
	'treatment_messaging_slider',
	'treatment_email_messaging_slider',
	'treatment_email_messaging_slider_simplified',
];

const SIMPLE_SLIDER_VARIATIONS: AccountCreationExperimentVariant[] = [
	'treatment_email_messaging_slider_simplified',
];

function useAccountCreationExperiment(): AccountCreationExperimentResult {
	// The account-step A/B/n experiment (calypso_account_step_improvement_202601) ended and
	// its plumbing was removed. We're keeping the winning "open email + slider" treatment
	// alive for one specific entry point: users arriving from woocommerce.com with
	// ref=woo-hosting-solutions-flow. Everyone else sees the current default.
	const isWooHostingSolutions = useQuery().get( 'ref' ) === WOO_HOSTING_SOLUTIONS_REF;
	const variationName: AccountCreationExperimentVariant = isWooHostingSolutions
		? 'treatment_email_slider'
		: 'control';

	return {
		isLoading: false,
		variationName,
		isExperimentVariant: variationName !== 'control',
		isEmailVariation: EMAIL_VARIATIONS.includes( variationName ),
		isMessagingVariation: MESSAGING_VARIATIONS.includes( variationName ),
		isSliderVariation: SLIDER_VARIATIONS.includes( variationName ),
		isSimpleSliderVariation: SIMPLE_SLIDER_VARIATIONS.includes( variationName ),
	};
}

export default useAccountCreationExperiment;
export type { AccountCreationExperimentVariant, AccountCreationExperimentResult };
