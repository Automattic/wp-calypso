/**
 * External dependencies
 */
import { useHistory } from 'react-router-dom';
import { useSelect, useDispatch } from '@wordpress/data';
import { useLocale } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import { Step, usePath, useCurrentStep, StepType } from '../path';
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { USER_STORE } from '../stores/user';
import { useNewSiteVisibility, useHasPaidPlanFromPath } from './use-selected-plan';
import useSignup from './use-signup';

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
	const { hasSiteTitle } = useSelect( ( select ) => select( ONBOARD_STORE ) );
	const isAnchorFmSignup: boolean = useSelect( ( select ) =>
		select( ONBOARD_STORE ).getIsAnchorFmSignup()
	);

	const makePath = usePath();
	const history = useHistory();
	const currentStep = useCurrentStep();
	const locale = useLocale();

	let steps: StepType[];

	// If anchor_podcast param, show Intent Gathering, Design, and Style steps.
	if ( isAnchorFmSignup ) {
		steps = [ Step.IntentGathering, Step.DesignSelection, Step.Style ];
		// If site title is skipped, we're showing Domains step before Features step. If not, we are showing Domains step next.
	} else if ( hasSiteTitle() ) {
		steps = [
			Step.IntentGathering,
			Step.Domains,
			Step.DesignSelection,
			Step.Style,
			Step.Features,
			Step.Plans,
		];
	} else {
		steps = [
			Step.IntentGathering,
			Step.DesignSelection,
			Step.Style,
			Step.Domains,
			Step.Features,
			Step.Plans,
		];
	}

	// @TODO: move site creation to a separate hook or an action on the ONBOARD store
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const newUser = useSelect( ( select ) => select( USER_STORE ).getNewUser() );

	const { createSite } = useDispatch( ONBOARD_STORE );
	const newSiteVisibility = useNewSiteVisibility();
	const { onSignupDialogOpen } = useSignup();
	const handleSiteCreation = () => {
		if ( currentUser ) {
			return createSite( currentUser.username, locale, undefined, newSiteVisibility );
		}
		// Adding a newUser check works for Anchor.fm flow.  Without it, we ask for login twice.
		// XXX TODO Test: Does this break non-anchor gutenboarding?
		if ( newUser && newUser.username !== undefined ) {
			return createSite( newUser.username, locale, undefined, newSiteVisibility );
		}
		return onSignupDialogOpen();
	};

	// Logic necessary to skip Domains or Plans steps
	const { domain, hasUsedDomainsStep, hasUsedPlansStep } = useSelect( ( select ) =>
		select( ONBOARD_STORE ).getState()
	);
	const plan = useSelect( ( select ) => select( ONBOARD_STORE ).getPlan() );
	const hasPaidPlanFromPath = useHasPaidPlanFromPath();

	if ( domain && ! hasUsedDomainsStep ) {
		steps = steps.filter( ( step ) => step !== Step.Domains );
	}

	// Don't show the mandatory Plans step:
	// - if the user landed from a marketing page after selecting a paid plan (in this case, hide also the Features step)
	// - if this is an Anchor.fm signup
	// - if a plan has been selected using the PlansModal but only if there is no Features step
	if (
		hasPaidPlanFromPath ||
		isAnchorFmSignup ||
		( ! steps.includes( Step.Features ) && plan && ! hasUsedPlansStep )
	) {
		steps = steps.filter( ( step ) => step !== Step.Plans && step !== Step.Features );
	}

	const currentStepIndex = steps.findIndex( ( step ) => step === Step[ currentStep ] );
	const previousStepPath = currentStepIndex > 0 ? makePath( steps[ currentStepIndex - 1 ] ) : '';
	const nextStepPath =
		currentStepIndex < steps.length - 1 ? makePath( steps[ currentStepIndex + 1 ] ) : '';

	const isLastStep = currentStepIndex === steps.length - 1;

	const handleBack = () => history.push( previousStepPath );
	const handleNext = () => ( isLastStep ? handleSiteCreation() : history.push( nextStepPath ) );

	return {
		goBack: handleBack,
		goNext: handleNext,
	};
}
