/**
 * External dependencies
 */
import { useHistory, useLocation } from 'react-router-dom';
import { useSelect, useDispatch } from '@wordpress/data';
import { useLocale } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import {
	GutenLocationStateType,
	Step,
	usePath,
	useCurrentStep,
	useAnchorFmPodcastId,
	useAnchorFmEpisodeId,
} from '../path';
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { USER_STORE } from '../stores/user';
import { useNewSiteVisibility } from './use-selected-plan';
import useSignup from './use-signup';
import useSteps from './use-steps';

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
	const locale = useLocale();

	const steps = useSteps();

	// @TODO: move site creation to a separate hook or an action on the ONBOARD store
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const newUser = useSelect( ( select ) => select( USER_STORE ).getNewUser() );
	const anchorFmPodcastId = useAnchorFmPodcastId();
	const anchorFmEpisodeId = useAnchorFmEpisodeId();

	const { createSite } = useDispatch( ONBOARD_STORE );
	const newSiteVisibility = useNewSiteVisibility();
	const { onSignupDialogOpen } = useSignup();
	const handleSiteCreation = () => {
		if ( currentUser ) {
			return createSite( {
				username: currentUser.username,
				languageSlug: locale,
				bearerToken: undefined,
				visibility: newSiteVisibility,
				anchorFmPodcastId,
				anchorFmEpisodeId,
			} );
		}
		// Adding a newUser check works for Anchor.fm flow.  Without it, we ask for login twice.
		if ( newUser?.username ) {
			return createSite( {
				username: newUser.username,
				languageSlug: locale,
				bearerToken: undefined,
				visibility: newSiteVisibility,
				anchorFmPodcastId,
				anchorFmEpisodeId,
			} );
		}
		return onSignupDialogOpen();
	};

	const currentStepIndex = steps.findIndex( ( step ) => step === Step[ currentStep ] );
	const previousStepPath = currentStepIndex > 0 ? makePath( steps[ currentStepIndex - 1 ] ) : '';
	const nextStepPath =
		currentStepIndex < steps.length - 1 ? makePath( steps[ currentStepIndex + 1 ] ) : '';

	const isLastStep = currentStepIndex === steps.length - 1;

	// Transfer anchor podcast ID, episode ID from the query string to the location state, if needed
	const locationState = useLocation< GutenLocationStateType >().state ?? {};
	if ( anchorFmPodcastId ) {
		locationState.anchorFmPodcastId = anchorFmPodcastId;
	}
	if ( anchorFmEpisodeId ) {
		locationState.anchorFmEpisodeId = anchorFmEpisodeId;
	}

	const handleBack = () => history.push( previousStepPath, locationState );
	const handleNext = () =>
		isLastStep ? handleSiteCreation() : history.push( nextStepPath, locationState );

	return {
		goBack: handleBack,
		goNext: handleNext,
	};
}
