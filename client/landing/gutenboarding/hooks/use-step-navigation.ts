/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { Step, usePath, useCurrentStep } from '../path';
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';

/**
 * A React hook that returns previous and next steps in Gutenboarding flow
 *
 * @typedef { object } NavigationPath
 * @property { string } previousStepPath of the previous step
 * @property { string } nextStepPath of the next step
 *
 * @returns { NavigationPath } An object with paths for previous and next steps
 */
export default function useStepNavigation(): { previousStepPath: string; nextStepPath: string } {
	const makePath = usePath();
	const currentStep = useCurrentStep();
	const siteTitle = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedSiteTitle() );

	// If the user enters a site title on Intent Capture step we are showing Domains step next.
	// Else, we're showing Domains step before Plans step.
	const steps = siteTitle
		? [ Step.IntentGathering, Step.Domains, Step.DesignSelection, Step.Style, Step.Plans ]
		: [ Step.IntentGathering, Step.DesignSelection, Step.Style, Step.Domains, Step.Plans ];

	const currentStepIndex = steps.findIndex( ( step ) => step === Step[ currentStep ] );

	return {
		previousStepPath: currentStepIndex > 0 ? makePath( steps[ currentStepIndex - 1 ] ) : '',
		nextStepPath:
			currentStepIndex < steps.length - 1 ? makePath( steps[ currentStepIndex + 1 ] ) : '',
	};
}
