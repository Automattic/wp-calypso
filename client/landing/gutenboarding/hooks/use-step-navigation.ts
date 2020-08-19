/**
 * External dependencies
 */
import { isEnabled } from 'config';
import { useHistory } from 'react-router-dom';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { Step, usePath, useCurrentStep } from '../path';
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { USER_STORE } from '../stores/user';
import { useShouldSiteBePublic } from './use-selected-plan';
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
	const { isExperimental } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );

	const makePath = usePath();
	const history = useHistory();
	const currentStep = useCurrentStep();
	const { i18nLocale } = useI18n();

	// If the user enters a site title on Intent Capture step we are showing Domains step next.
	// Else, we're showing Domains step before Plans step.
	let steps = hasSiteTitle()
		? [ Step.IntentGathering, Step.Domains, Step.DesignSelection, Step.Style, Step.Plans ]
		: [ Step.IntentGathering, Step.DesignSelection, Step.Style, Step.Domains, Step.Plans ];

	if ( isExperimental && isEnabled( 'gutenboarding/feature-picker' ) ) {
		steps = hasSiteTitle()
			? [
					Step.IntentGathering,
					Step.Domains,
					Step.DesignSelection,
					Step.Style,
					Step.Features,
					Step.Plans,
			  ]
			: [
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
	const { createSite } = useDispatch( ONBOARD_STORE );
	const shouldSiteBePublic = useShouldSiteBePublic();
	const { onSignupDialogOpen } = useSignup();
	const handleSiteCreation = () =>
		currentUser
			? createSite( currentUser.username, i18nLocale, undefined, shouldSiteBePublic )
			: onSignupDialogOpen();

	// Logic necessary to skip Domains or Plans steps
	const { domain, hasUsedDomainsStep, hasUsedPlansStep } = useSelect( ( select ) =>
		select( ONBOARD_STORE ).getState()
	);
	const plan = useSelect( ( select ) => select( ONBOARD_STORE ).getPlan() );

	if ( domain && ! hasUsedDomainsStep ) {
		steps = steps.filter( ( step ) => step !== Step.Domains );
	}

	if ( plan && ! hasUsedPlansStep ) {
		steps = steps.filter( ( step ) => step !== Step.Plans );
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
