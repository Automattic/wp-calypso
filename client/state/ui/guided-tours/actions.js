/**
 * Internal dependencies
 */
import {
	GUIDED_TOUR_SHOW,
	GUIDED_TOUR_UPDATE,
} from 'state/action-types';

import {
	withAnalytics,
	recordTracksEvent,
} from 'state/analytics/actions';

import guidedToursConfig from 'layout/guided-tours/config';

/**
 * Returns an action object which will be used to hide or show a specific tour.
 *
 * @param {Object} options Options object, see fn signature.
 * @return {Object} Action object
 */
export function showGuidedTour( { shouldShow, shouldDelay = false, tour = 'main' } ) {
	const showAction = {
		type: GUIDED_TOUR_SHOW,
		shouldShow,
		shouldDelay,
		tour,
	};

	const trackEvent = recordTracksEvent( 'calypso_guided_tours_show', {
		tour_version: guidedToursConfig.get( tour ).version,
		tour,
	} );

	return shouldDelay ? showAction : withAnalytics( trackEvent, showAction );
}

export function quitGuidedTour( { tour = 'main', stepName, finished, error } ) {
	const quitAction = {
		type: GUIDED_TOUR_UPDATE,
		shouldShow: false,
		shouldReallyShow: false,
		shouldDelay: false,
		tour,
		stepName,
	};

	const trackEvent = recordTracksEvent( `calypso_guided_tours_${ finished ? 'finished' : 'quit' }`, {
		step: stepName,
		tour_version: guidedToursConfig.get( tour ).version,
		tour,
		error,
	} );

	return withAnalytics( trackEvent, quitAction );
}
export function nextGuidedTourStep( { tour = 'main', stepName } ) {
	const nextAction = {
		type: GUIDED_TOUR_UPDATE,
		stepName,
	};

	const trackEvent = recordTracksEvent( 'calypso_guided_tours_next_step', {
		step: stepName,
		tour_version: guidedToursConfig.get( tour ).version,
		tour,
	} );

	return withAnalytics( trackEvent, nextAction );
}
