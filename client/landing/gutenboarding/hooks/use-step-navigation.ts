/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { useHistory } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { Step, usePath, useCurrentStep } from '../path';
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';

/**
 * A React hook that returns callback to navigate to previous and next steps in Gutenboarding flow
 *
 * @typedef { object } Navigation
 * @property { string } goBack of the previous step
 * @property { string } goNext of the next step
 *
 * @returns { Navigation } An object with callbacks to navigate to previous and next steps
 */
export default function useStepNavigation(): { goBack: () => void; goNext: () => void } {
	const makePath = usePath();
	const history = useHistory();
	const currentStep = useCurrentStep();
	const siteTitle = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedSiteTitle() );

	// If the user enters a site title on Intent Capture step we are showing Domains step next.
	// Else, we're showing Domains step before Plans step.
	const steps = siteTitle
		? [ Step.IntentGathering, Step.Domains, Step.DesignSelection, Step.Style, Step.Plans ]
		: [ Step.IntentGathering, Step.DesignSelection, Step.Style, Step.Domains, Step.Plans ];

	const currentStepIndex = steps.findIndex( ( step ) => step === Step[ currentStep ] );

	const previousStepPath = currentStepIndex > 0 ? makePath( steps[ currentStepIndex - 1 ] ) : '';
	const nextStepPath =
		currentStepIndex < steps.length - 1 ? makePath( steps[ currentStepIndex + 1 ] ) : '';

	const handleBack = () => history.push( previousStepPath );
	const handleNext = () => history.push( nextStepPath );

	return {
		goBack: handleBack,
		goNext: handleNext,
	};
}
