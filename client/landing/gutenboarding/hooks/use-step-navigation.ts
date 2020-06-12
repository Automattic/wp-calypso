/**
 * External dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { useHistory } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { Step, usePath, useCurrentStep } from '../path';
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';

import { useShouldSiteBePublicOnSelectedPlan } from './use-selected-plan';
import { useFreeDomainSuggestion } from './use-free-domain-suggestion';
import { USER_STORE } from '../stores/user';
import useSignup from './use-signup';
import { PLANS_STORE } from '../stores/plans';

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
	let steps = siteTitle
		? [ Step.IntentGathering, Step.Domains, Step.DesignSelection, Step.Style, Step.Plans ]
		: [ Step.IntentGathering, Step.DesignSelection, Step.Style, Step.Domains, Step.Plans ];

	// @TODO: move site creation to a separate hook or an action on the ONBOARD store
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const { createSite } = useDispatch( ONBOARD_STORE );
	const shouldSiteBePublic = useShouldSiteBePublicOnSelectedPlan();
	const freeDomainSuggestion = useFreeDomainSuggestion();
	const { onSignupDialogOpen } = useSignup();
	const handleSiteCreation = () =>
		currentUser
			? createSite( currentUser.username, freeDomainSuggestion, undefined, shouldSiteBePublic )
			: onSignupDialogOpen();

	// Logic necessary to skip Domains or Plans steps
	const { domain, hasUsedPlansStep } = useSelect( ( select ) =>
		select( ONBOARD_STORE ).getState()
	);
	const plan = useSelect( ( select ) => select( PLANS_STORE ).getSelectedPlan() );

	// remove Domains step only if it's at the end
	if ( ! siteTitle && domain ) {
		steps = steps.filter( ( step ) => step !== Step.Domains );
	}
	if ( plan && ! hasUsedPlansStep ) {
		steps = steps.filter( ( step ) => step !== Step.Plans );
	}

	const currentStepIndex = steps.findIndex( ( step ) => step === Step[ currentStep ] );
	const previousStepPath = currentStepIndex > 0 ? makePath( steps[ currentStepIndex - 1 ] ) : '';
	const nextStepPath =
		currentStepIndex < steps.length - 1 ? makePath( steps[ currentStepIndex + 1 ] ) : '';

	// Plans and Domains step are skipped if plan/domain is already selected.
	const isLastStep = currentStepIndex === steps.length - 1 || currentStepIndex === -1; // final step could have been removed because of selection

	const handleBack = () => history.push( previousStepPath );
	const handleNext = () => ( isLastStep ? handleSiteCreation() : history.push( nextStepPath ) );

	return {
		goBack: handleBack,
		goNext: handleNext,
	};
}
